'use strict';

import { AbstractQuery, ConnectionRefusedError, DatabaseError, EmptyResultError, ForeignKeyConstraintError, UniqueConstraintError, UnknownConstraintError } from '@sequelize/core';
import { logger } from '@sequelize/core/_non-semver-use-at-your-own-risk_/utils/logger.js';

const debug = logger.debugContext('sql:ibmi');

export class IBMiQuery extends AbstractQuery {
  getInsertIdField() {
    return 'id';
  }

  async run(sql, parameters) {
    this.sql = sql.replace(/;$/, '');

    const complete = this._logQuery(sql, debug, parameters);

    let results;
    let response;
    try {
      let query;
      if (parameters) {
        query = await this.connection.query(this.sql, {
          parameters: parameters
        });
      } else {
        query = await this.connection.query(this.sql);
      }
      response = await query.execute();

      console.log(response)

      if (response.data) {
        results = response;
      }

      while (!response.is_done) {
        response = await query.fetchMore();

        if (response.data) {
          results.data = [...results.data, ...response.data]
        }
      }
      await query.close();
    } catch (error) {
      throw this.formatError(error);
    }

    complete();

    if (results.data && results.data.length > 0) {
      for (const row of results.data) {
        for (const column of results.metadata.columns) {
          const value = row[column.name];
          if (value == null) {
            continue;
          }

          const parse = this.sequelize.dialect.getParserForDatabaseDataType(column.type);
          if (parse) {
            row[column.name] = parse(value);
          }
        }
      }
    }

    return this.formatResults(results);
  }

  /**
   * High level function that handles the results of a query execution.
   *
   *
   * Example:
   *  query.formatResults([
   *    {
   *      id: 1,              // this is from the main table
   *      attr2: 'snafu',     // this is from the main table
   *      Tasks.id: 1,        // this is from the associated table
   *      Tasks.title: 'task' // this is from the associated table
   *    }
   *  ])
   *
   * @param {Array} results - The result of the query execution.
   * @private
   */
  formatResults(results) {
    if (this.isInsertQuery() || this.isUpdateQuery() || this.isUpsertQuery()) {
      if (this.instance && this.instance.dataValues) {
        if (this.isInsertQuery() && !this.isUpsertQuery() && results.data.length === 0) {
          throw new EmptyResultError();
        }

        if (this.options.returning && Array.isArray(results.data) && results.data[0]) {
          for (const attributeOrColumnName of Object.keys(results.data[0])) {
            const modelDefinition = this.model.modelDefinition;
            const attribute = modelDefinition.columns.get(attributeOrColumnName);
            const updatedValue = this._parseDatabaseValue(results.data[0][attributeOrColumnName], attribute?.type);

            this.instance.set(attribute?.attributeName ?? attributeOrColumnName, updatedValue, {
              raw: true,
              comesFromDatabase: true
            });
          }
        }
      }

      if (this.isUpsertQuery()) {
        return [this.instance, null];
      }

      return [this.instance || (results.data && ((this.options.plain && results.data[0]) || results.data)) || undefined, results.update_count];
    }

    if (this.isSelectQuery()) {
      return this.handleSelectQuery(results.data);
    }

    if (this.isShowIndexesQuery()) {
      return this.handleShowIndexesQuery(results.data);
    }

    if (this.isDescribeQuery()) {
      const result = {};

      for (const _result of results.data) {
        const enumRegex = /^enum/i;
        result[_result.COLUMN_NAME] = {
          type: enumRegex.test(_result.Type) ? _result.Type.replace(enumRegex, 'ENUM') : _result.DATA_TYPE.toUpperCase(),
          allowNull: _result.IS_NULLABLE === 'Y',
          defaultValue: _result.COLUMN_DEFAULT,
          primaryKey: _result.CONSTRAINT_TYPE === 'PRIMARY KEY',
          autoIncrement: _result.IS_GENERATED !== 'IDENTITY_GENERATION'
        };
      }

      return result;
    }

    if (this.isCallQuery()) {
      return results.data[0];
    }

    if (this.isDeleteQuery()) {
      return results.data.length;
    }

    if (this.isBulkUpdateQuery()) {
      return this.options.returning ? this.handleSelectQuery(results.data) : results.update_count;
    }

    if (this.isShowConstraintsQuery()) {
      return results.data;
    }

    if (this.isRawQuery()) {
      // MySQL returns row data and metadata (affected rows etc) in a single object - let's standarize it, sorta
      return [results.data, results.data];
    }

    return this.instance;
  }

  handleInsertQuery(results, metaData) {
    if (this.instance) {
      // add the inserted row id to the instance
      const autoIncrementAttribute = this.model.autoIncrementAttribute.field;
      let id = null;

      id ||= results && results[autoIncrementAttribute];
      id ||= metaData && metaData[autoIncrementAttribute];

      this.instance[this.model.autoIncrementAttribute] = id;
    }
  }

  handleShowIndexesQuery(data) {
    const indexes = Object.create(null);

    data.forEach(item => {
      if (Object.hasOwn(indexes, item.NAME)) {
        indexes[item.NAME].fields.push({
          attribute: item.COLUMN_NAME,
          length: undefined,
          order: undefined,
          collate: undefined
        });
      } else {
        indexes[item.NAME] = {
          primary: item.CONSTRAINT_TYPE === 'PRIMARY KEY',
          fields: [
            {
              attribute: item.COLUMN_NAME,
              length: undefined,
              order: undefined,
              collate: undefined
            }
          ],
          name: item.NAME,
          tableName: item.TABLE_NAME,
          unique: item.CONSTRAINT_TYPE === 'PRIMARY KEY' || item.CONSTRAINT_TYPE === 'UNIQUE',
          type: item.CONSTRAINT_TYPE
        };
      }
    });

    return Object.values(indexes);
  }

  formatError(err) {
    if (err.message.toString().includes('Error connecting to the database') 
      || err.message.toString().includes('getaddrinfo ENOTFOUND') 
      || err.message.toString().includes('connect ECONNREFUSED') 
      || err.message.toString().includes('Password is incorrect') 
      || err.message.toString().includes('connect ETIMEDOUT')) {
      this.connection.connected = false;
      if (err.message.toString().includes('Error connecting to the database')) {
        return new ConnectionRefusedError(error);
      }

      if (err.message.toString().includes('getaddrinfo ENOTFOUND')) {
        return new HostNotFoundError(error);
      }

      if (err.message.toString().includes('connect ECONNREFUSED')) {
        return new ConnectionRefusedError(error);
      }

      if (err.message.toString().includes('Password is incorrect')) {
        return new AccessDeniedError(error);
      }

      if (err.message.toString().includes('connect ETIMEDOUT')) {
        return new ConnectionAcquireTimeoutError('Timeout connecting to database', error);
      }
    }
    

    const foreignKeyConstraintCodes = [
      '-530', // The insert or update value of a foreign key is invalid.
      '-531', // The update or delete of a parent key is prevented by a NO ACTION update or delete rule.
      '-532' // The update or delete of a parent key is prevented by a NO ACTION update or delete rule.
    ];
    const uniqueConstraintCodes = [
      '-803' // A violation of the constraint imposed by a unique index or a unique constraint occurred.
    ];

    if (foreignKeyConstraintCodes.includes(err.message)) {
      return new ForeignKeyConstraintError({
        cause: err,
        sql: {},
        fields: {}
      });
    }

    if (uniqueConstraintCodes.includes(err.message)) {
      return new UniqueConstraintError({
        errors: [err.message],
        cause: err,
        sql: {},
        fields: {}
      });
    }

    if (err.message?.includes('-204')) {
      const constraintNameRegex = /(\w+)\s+in\s+(\w+)\s+type\s+(\*\w+)/;
      const constraintNameRegexMatches = err.message?.match(constraintNameRegex);
      if (constraintNameRegexMatches && constraintNameRegexMatches.length === 4) {
        const constraintName = constraintNameRegexMatches[1];
        const type = constraintNameRegexMatches[2];

        if (type === '*N') {
          return new UnknownConstraintError({
            cause: err,
            constraint: constraintName
          });
        }
      }
    }

    return new DatabaseError(err);
  }
}
