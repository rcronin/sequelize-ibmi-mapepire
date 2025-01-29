import { AbstractQueryGeneratorInternal } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/query-generator-internal.js';
import type { AddLimitOffsetOptions } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/query-generator.internal-types.js';
import type { IBMiDialect } from './dialect.js';

export class IBMiQueryGeneratorInternal<Dialect extends IBMiDialect = IBMiDialect> extends AbstractQueryGeneratorInternal<Dialect> {
  addLimitAndOffset(options: AddLimitOffsetOptions) {
    let fragment = '';
    if (options.offset) {
      fragment += ` OFFSET ${this.queryGenerator.escape(options.offset, options)} ROWS`;
    }
    if (options.limit != null) {
      fragment += ` LIMIT ${this.queryGenerator.escape(options.limit, options)}`;
    }
    return fragment;
  }
}
