import { AbstractQueryGeneratorInternal } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/query-generator-internal.js';
import type { AddLimitOffsetOptions } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/query-generator.internal-types.js';
import { formatDb2StyleLimitOffset } from '@sequelize/core/_non-semver-use-at-your-own-risk_/utils/sql.js';
import type { IBMiDialect } from './dialect.js';

export class IBMiQueryGeneratorInternal<Dialect extends IBMiDialect = IBMiDialect> extends AbstractQueryGeneratorInternal<Dialect> {
  addLimitAndOffset(options: AddLimitOffsetOptions) {
    // Db2 for i does not accept `OFFSET n ROWS LIMIT m`; it requires the
    // standard `OFFSET n ROWS FETCH NEXT m ROWS ONLY` form when both are present.
    return formatDb2StyleLimitOffset(options, this.queryGenerator);
  }
}
