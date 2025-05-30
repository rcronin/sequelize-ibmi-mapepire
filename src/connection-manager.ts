import * as Mapepire from '@ibm/mapepire-js';
import { SQLJob, DaemonServer } from '@ibm/mapepire-js';
import type { AbstractConnection, ConnectionOptions } from '@sequelize/core';
import { AbstractConnectionManager, AccessDeniedError, ConnectionAcquireTimeoutError, ConnectionRefusedError, HostNotFoundError } from '@sequelize/core';
import { logger } from '@sequelize/core/_non-semver-use-at-your-own-risk_/utils/logger.js';
import type { IBMiDialect } from './dialect.js';

const debug = logger.debugContext('connection:ibmi');

export type MapepireModule = typeof Mapepire;

export interface IBMiConnection extends AbstractConnection, SQLJob {
  // properties of ObdcConnection, but not declared in their typings
  connected: boolean;
}



export interface IBMiConnectionOptions extends DaemonServer {
  jdbcOptions?: Mapepire.JDBCOptions;
}

export class IBMiConnectionManager extends AbstractConnectionManager<IBMiDialect, IBMiConnection> {
  readonly #lib: MapepireModule;

  constructor(dialect: IBMiDialect) {
    super(dialect);
    this.#lib = Mapepire;
  }

  async connect(config: ConnectionOptions<IBMiDialect>): Promise<IBMiConnection> {
    const connection = (config.jdbcOptions ? new Mapepire.SQLJob(config.jdbcOptions) : new Mapepire.SQLJob()) as IBMiConnection;
    try {
      await connection.connect(config);
      connection.connected = true;
    } catch (error) {
      connection.connected = false;
      debug('Error connecting to the database:', error);
      void this.sequelize.pool.destroy(connection);
      if (!(error instanceof Error)) {
        throw error;
      }

      if (error.message.toString().includes('Error connecting to the database')) {
        throw new ConnectionRefusedError(error);
      }

      if (error.message.toString().includes('getaddrinfo ENOTFOUND')) {
        throw new HostNotFoundError(error);
      }

      if (error.message.toString().includes('connect ECONNREFUSED')) {
        throw new ConnectionRefusedError(error);
      }

      if (error.message.toString().includes('Password is incorrect')) {
        throw new AccessDeniedError(error);
      }

      if (error.message.toString().includes('connect ETIMEDOUT')) {
        throw new ConnectionAcquireTimeoutError('Timeout connecting to database', error);
      }

      throw error;
    }

    return connection;
  }

  async disconnect(connection: IBMiConnection): Promise<void> {
    if (!this.validate(connection)) {
      debug('Tried to disconnect, but connection was already closed.');

      return;
    }

    await connection.close();
  }

  validate(connection: IBMiConnection): boolean {
    return connection.connected && connection.getStatus() !== Mapepire.States.JobStatus.ENDED;
  }
}
