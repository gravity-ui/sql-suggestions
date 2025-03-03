import {
    ExtractStatementPositionsResult,
    StatementExtractionStrategy,
} from '../../../shared/extract-statement-positions-from-query';
import {extractTrinoStatementPositionsFromQuery} from '../index';

test('should extract statements from single query', () => {
    const query = 'SELECT * FROM catalog.schema.test_table WHERE id = 1;';
    const result = extractTrinoStatementPositionsFromQuery(query);
    const expectedResult: ExtractStatementPositionsResult = {
        statementPositions: [
            {
                startIndex: 0,
                endIndex: 53,
            },
        ],
        strategy: StatementExtractionStrategy.Autocomplete,
    };

    expect(result).toEqual(expectedResult);

    expect(
        query.slice(
            result.statementPositions[0]?.startIndex,
            result.statementPositions[0]?.endIndex,
        ),
    ).toBe('SELECT * FROM catalog.schema.test_table WHERE id = 1;');
});

test('should extract statements from single query with block comment inside', () => {
    const query = 'SELECT * FROM /* comment inside */ catalog.schema.test_table WHERE id = 1;';
    const result = extractTrinoStatementPositionsFromQuery(query);

    expect(result).toEqual({
        statementPositions: [
            {
                startIndex: 0,
                endIndex: 74,
            },
        ],
        strategy: StatementExtractionStrategy.Autocomplete,
    });

    expect(
        query.slice(
            result.statementPositions[0]?.startIndex,
            result.statementPositions[0]?.endIndex,
        ),
    ).toBe('SELECT * FROM /* comment inside */ catalog.schema.test_table WHERE id = 1;');
});

test('should extract statements from single query with inlined comment inside', () => {
    const query = `SELECT * FROM
          catalog.schema.test_table -- comment here
      WHERE id = 1;`;
    const result = extractTrinoStatementPositionsFromQuery(query);
    const expectedResult: ExtractStatementPositionsResult = {
        statementPositions: [
            {
                startIndex: 0,
                endIndex: 85,
            },
        ],
        strategy: StatementExtractionStrategy.Autocomplete,
    };

    expect(result).toEqual(expectedResult);

    expect(
        query.slice(
            result.statementPositions[0]?.startIndex,
            result.statementPositions[0]?.endIndex,
        ),
    ).toBe(
        `SELECT * FROM
          catalog.schema.test_table -- comment here
      WHERE id = 1;`,
    );
});

test('should extract statement from query without inlined comment at the end', () => {
    const query = 'SELECT * FROM catalog.schema.test_table WHERE id = 1; -- comment here';
    const result = extractTrinoStatementPositionsFromQuery(query);
    const expectedResult: ExtractStatementPositionsResult = {
        statementPositions: [
            {
                startIndex: 0,
                endIndex: 53,
            },
        ],
        strategy: StatementExtractionStrategy.Autocomplete,
    };

    expect(result).toEqual(expectedResult);

    expect(
        query.slice(
            result.statementPositions[0]?.startIndex,
            result.statementPositions[0]?.endIndex,
        ),
    ).toBe('SELECT * FROM catalog.schema.test_table WHERE id = 1;');
});

test('should extract unfinished statement', () => {
    const query = 'SELECT * FROM catalog.schema.test_table WHERE id =';
    const result = extractTrinoStatementPositionsFromQuery(query);
    const expectedResult: ExtractStatementPositionsResult = {
        statementPositions: [
            {
                startIndex: 0,
                endIndex: 50,
            },
        ],
        strategy: StatementExtractionStrategy.Autocomplete,
    };

    expect(result).toEqual(expectedResult);

    expect(
        query.slice(
            result.statementPositions[0]?.startIndex,
            result.statementPositions[0]?.endIndex,
        ),
    ).toBe('SELECT * FROM catalog.schema.test_table WHERE id =');
});

test('should extract finished and unfinished statements', () => {
    const query = `SELECT * FROM catalog.schema.test_table WHERE id = 1; SELECT * FROM catalog.schema.test_table WHERE id =`;
    const result = extractTrinoStatementPositionsFromQuery(query);
    const expectedResult: ExtractStatementPositionsResult = {
        statementPositions: [
            {
                startIndex: 0,
                endIndex: 53,
            },
            {
                startIndex: 54,
                endIndex: 104,
            },
        ],
        strategy: StatementExtractionStrategy.Autocomplete,
    };

    expect(result).toEqual(expectedResult);

    expect(
        query.slice(
            result.statementPositions[0]?.startIndex,
            result.statementPositions[0]?.endIndex,
        ),
    ).toBe('SELECT * FROM catalog.schema.test_table WHERE id = 1;');
    expect(
        query.slice(
            result.statementPositions[1]?.startIndex,
            result.statementPositions[1]?.endIndex,
        ),
    ).toBe('SELECT * FROM catalog.schema.test_table WHERE id =');
});

test('should not extract any statement from comments', () => {
    const query = `
      -- SELECT * FROM catalog.schema.test_table WHERE id = 1;
      /* SELECT * FROM catalog.schema.test_table WHERE id = 1; */
  `;
    const result = extractTrinoStatementPositionsFromQuery(query);

    expect(result).toEqual({statementPositions: [], strategy: StatementExtractionStrategy.Tokens});
});

test('should ignore empty statements', () => {
    const query = `;;;;;;`;
    const result = extractTrinoStatementPositionsFromQuery(query);

    expect(result).toEqual({statementPositions: [], strategy: StatementExtractionStrategy.Tokens});
});

test('should ignore newlines', () => {
    const query = '\n\n\n\n';
    const result = extractTrinoStatementPositionsFromQuery(query);

    expect(result).toEqual({statementPositions: [], strategy: StatementExtractionStrategy.Tokens});
});

test('should extract statements from multiple query', () => {
    const query =
        'SELECT * FROM catalog.schema.test_table WHERE id = 1;\nSELECT * FROM catalog.schema.test_table WHERE id = 2;';

    const result = extractTrinoStatementPositionsFromQuery(query);
    const expectedResult: ExtractStatementPositionsResult = {
        statementPositions: [
            {
                startIndex: 0,
                endIndex: 53,
            },
            {
                startIndex: 54,
                endIndex: 107,
            },
        ],
        strategy: StatementExtractionStrategy.Autocomplete,
    };

    expect(result).toEqual(expectedResult);

    expect(
        query.slice(
            result.statementPositions[0]?.startIndex,
            result.statementPositions[0]?.endIndex,
        ),
    ).toBe('SELECT * FROM catalog.schema.test_table WHERE id = 1;');
    expect(
        query.slice(
            result.statementPositions[1]?.startIndex,
            result.statementPositions[1]?.endIndex,
        ),
    ).toBe('SELECT * FROM catalog.schema.test_table WHERE id = 2;');
});

test('should extract three statements from query', () => {
    const query =
        'SELECT * FROM catalog.schema.test_table WHERE id = 1;\nSELECT * FROM catalog.schema.test_table WHERE id = 2;/* comment inside */SELECT 1;';

    const result = extractTrinoStatementPositionsFromQuery(query);
    const expectedResult: ExtractStatementPositionsResult = {
        statementPositions: [
            {
                startIndex: 0,
                endIndex: 53,
            },
            {
                startIndex: 54,
                endIndex: 107,
            },
            {
                startIndex: 127,
                endIndex: 136,
            },
        ],
        strategy: StatementExtractionStrategy.Autocomplete,
    };

    expect(result).toEqual(expectedResult);

    expect(
        query.slice(
            result.statementPositions[0]?.startIndex,
            result.statementPositions[0]?.endIndex,
        ),
    ).toBe('SELECT * FROM catalog.schema.test_table WHERE id = 1;');
    expect(
        query.slice(
            result.statementPositions[1]?.startIndex,
            result.statementPositions[1]?.endIndex,
        ),
    ).toBe('SELECT * FROM catalog.schema.test_table WHERE id = 2;');
    expect(
        query.slice(
            result.statementPositions[2]?.startIndex,
            result.statementPositions[2]?.endIndex,
        ),
    ).toBe('SELECT 1;');
});

test('should fallback to tokens when query is not valid', () => {
    const query = 'SELECT * FROM catalog.schema.test_table WHERE id = 1;\nsel asd aaasdjalkdj';

    const result = extractTrinoStatementPositionsFromQuery(query);
    const expectedResult: ExtractStatementPositionsResult = {
        statementPositions: [
            {
                startIndex: 0,
                endIndex: 53,
            },
            {
                startIndex: 54,
                endIndex: 73,
            },
        ],
        strategy: StatementExtractionStrategy.Tokens,
    };

    expect(result).toEqual(expectedResult);

    expect(
        query.slice(
            result.statementPositions[0]?.startIndex,
            result.statementPositions[0]?.endIndex,
        ),
    ).toBe('SELECT * FROM catalog.schema.test_table WHERE id = 1;');
    expect(
        query.slice(
            result.statementPositions[1]?.startIndex,
            result.statementPositions[1]?.endIndex,
        ),
    ).toBe('sel asd aaasdjalkdj');
});
