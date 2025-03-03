import {parseTrinoQueryWithCursor} from '../../index';
import {
    ColumnAliasSuggestion,
    ColumnSuggestion,
    KeywordSuggestion,
} from '../../../../shared/autocomplete-types';

test('should suggest properly after ORDER', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT * FROM catalog.schema.test_table ORDER |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'BY'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after ORDER with alias', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT * FROM catalog.schema.test_table as t ORDER |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'BY'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after ORDER BY', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT count(*) as count, test_column t1 FROM catalog.schema.test_table as t ORDER BY |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'NULL'},
        {value: 'INTERVAL'},
        {value: 'DOUBLE'},
        {value: 'FALSE'},
        {value: 'TRUE'},
        {value: 'POSITION'},
        {value: 'ROW'},
        {value: 'LISTAGG'},
        {value: 'FINAL'},
        {value: 'RUNNING'},
        {value: 'EXISTS'},
        {value: 'CASE'},
        {value: 'CAST'},
        {value: 'TRY_CAST'},
        {value: 'ARRAY'},
        {value: 'CURRENT_DATE'},
        {value: 'CURRENT_TIME'},
        {value: 'CURRENT_TIMESTAMP'},
        {value: 'LOCALTIME'},
        {value: 'LOCALTIMESTAMP'},
        {value: 'CURRENT_USER'},
        {value: 'CURRENT_CATALOG'},
        {value: 'CURRENT_SCHEMA'},
        {value: 'CURRENT_PATH'},
        {value: 'TRIM'},
        {value: 'SUBSTRING'},
        {value: 'NORMALIZE'},
        {value: 'EXTRACT'},
        {value: 'GROUPING'},
        {value: 'JSON_EXISTS'},
        {value: 'JSON_VALUE'},
        {value: 'JSON_QUERY'},
        {value: 'JSON_OBJECT'},
        {value: 'JSON_ARRAY'},
        {value: 'NOT'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);

    // TODO-TRINO: support functions
    // expect(autocompleteResult.suggestFunctions).toEqual(true);
    // expect(autocompleteResult.suggestAggregateFunctions).toEqual(true);

    const columnSuggestion: ColumnSuggestion = {
        tables: [{name: 'catalog.schema.test_table', alias: 't'}],
    };
    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestion);

    const columnAliasSuggestion: ColumnAliasSuggestion[] = [{name: 'count'}, {name: 't1'}];
    expect(autocompleteResult.suggestColumnAliases).toEqual(columnAliasSuggestion);
});

test('should suggest properly after ORDER BY between statements', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'ALTER TABLE catalog.schema.before_table DROP COLUMN id; ' +
            'SELECT count(*) as count, test_column t1 FROM catalog.schema.test_table as t ORDER BY | ; ' +
            'ALTER TABLE catalog.schema.after_table DROP COLUMN id;',
    );
    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'NULL'},
        {value: 'INTERVAL'},
        {value: 'DOUBLE'},
        {value: 'FALSE'},
        {value: 'TRUE'},
        {value: 'POSITION'},
        {value: 'ROW'},
        {value: 'LISTAGG'},
        {value: 'FINAL'},
        {value: 'RUNNING'},
        {value: 'EXISTS'},
        {value: 'CASE'},
        {value: 'CAST'},
        {value: 'TRY_CAST'},
        {value: 'ARRAY'},
        {value: 'CURRENT_DATE'},
        {value: 'CURRENT_TIME'},
        {value: 'CURRENT_TIMESTAMP'},
        {value: 'LOCALTIME'},
        {value: 'LOCALTIMESTAMP'},
        {value: 'CURRENT_USER'},
        {value: 'CURRENT_CATALOG'},
        {value: 'CURRENT_SCHEMA'},
        {value: 'CURRENT_PATH'},
        {value: 'TRIM'},
        {value: 'SUBSTRING'},
        {value: 'NORMALIZE'},
        {value: 'EXTRACT'},
        {value: 'GROUPING'},
        {value: 'JSON_EXISTS'},
        {value: 'JSON_VALUE'},
        {value: 'JSON_QUERY'},
        {value: 'JSON_OBJECT'},
        {value: 'JSON_ARRAY'},
        {value: 'NOT'},
    ];

    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);

    // TODO-TRINO: support functions
    // expect(autocompleteResult.suggestFunctions).toEqual(true);
    // expect(autocompleteResult.suggestAggregateFunctions).toEqual(true);

    const columnSuggestion: ColumnSuggestion = {
        tables: [{name: 'catalog.schema.test_table', alias: 't'}],
    };
    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestion);

    const columnAliasSuggestion: ColumnAliasSuggestion[] = [{name: 'count'}, {name: 't1'}];
    expect(autocompleteResult.suggestColumnAliases).toEqual(columnAliasSuggestion);
});

test('should suggest properly after ORDER BY in nested statement', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT id as id1 FROM (SELECT count(*) as count, test_column t1 FROM catalog.schema.test_table as t ORDER BY |',
    );
    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'NULL'},
        {value: 'INTERVAL'},
        {value: 'DOUBLE'},
        {value: 'FALSE'},
        {value: 'TRUE'},
        {value: 'POSITION'},
        {value: 'ROW'},
        {value: 'LISTAGG'},
        {value: 'FINAL'},
        {value: 'RUNNING'},
        {value: 'EXISTS'},
        {value: 'CASE'},
        {value: 'CAST'},
        {value: 'TRY_CAST'},
        {value: 'ARRAY'},
        {value: 'CURRENT_DATE'},
        {value: 'CURRENT_TIME'},
        {value: 'CURRENT_TIMESTAMP'},
        {value: 'LOCALTIME'},
        {value: 'LOCALTIMESTAMP'},
        {value: 'CURRENT_USER'},
        {value: 'CURRENT_CATALOG'},
        {value: 'CURRENT_SCHEMA'},
        {value: 'CURRENT_PATH'},
        {value: 'TRIM'},
        {value: 'SUBSTRING'},
        {value: 'NORMALIZE'},
        {value: 'EXTRACT'},
        {value: 'GROUPING'},
        {value: 'JSON_EXISTS'},
        {value: 'JSON_VALUE'},
        {value: 'JSON_QUERY'},
        {value: 'JSON_OBJECT'},
        {value: 'JSON_ARRAY'},
        {value: 'NOT'},
    ];

    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);

    // TODO-TRINO: support functions
    // expect(autocompleteResult.suggestFunctions).toEqual(true);
    // expect(autocompleteResult.suggestAggregateFunctions).toEqual(true);

    const columnSuggestion: ColumnSuggestion = {
        tables: [{name: 'catalog.schema.test_table', alias: 't'}],
    };
    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestion);

    const columnAliasSuggestion: ColumnAliasSuggestion[] = [{name: 'count'}, {name: 't1'}];
    expect(autocompleteResult.suggestColumnAliases).toEqual(columnAliasSuggestion);
});

test('should suggest properly after ORDER BY between statements in nested statement', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'ALTER TABLE catalog.schema.before_table DROP COLUMN id; ' +
            'SELECT id as id1 FROM (SELECT count(*) as count, test_column t1 FROM catalog.schema.test_table as t ORDER BY | ; ' +
            'ALTER TABLE catalog.schema.after_table DROP COLUMN id;',
    );
    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'NULL'},
        {value: 'INTERVAL'},
        {value: 'DOUBLE'},
        {value: 'FALSE'},
        {value: 'TRUE'},
        {value: 'POSITION'},
        {value: 'ROW'},
        {value: 'LISTAGG'},
        {value: 'FINAL'},
        {value: 'RUNNING'},
        {value: 'EXISTS'},
        {value: 'CASE'},
        {value: 'CAST'},
        {value: 'TRY_CAST'},
        {value: 'ARRAY'},
        {value: 'CURRENT_DATE'},
        {value: 'CURRENT_TIME'},
        {value: 'CURRENT_TIMESTAMP'},
        {value: 'LOCALTIME'},
        {value: 'LOCALTIMESTAMP'},
        {value: 'CURRENT_USER'},
        {value: 'CURRENT_CATALOG'},
        {value: 'CURRENT_SCHEMA'},
        {value: 'CURRENT_PATH'},
        {value: 'TRIM'},
        {value: 'SUBSTRING'},
        {value: 'NORMALIZE'},
        {value: 'EXTRACT'},
        {value: 'GROUPING'},
        {value: 'JSON_EXISTS'},
        {value: 'JSON_VALUE'},
        {value: 'JSON_QUERY'},
        {value: 'JSON_OBJECT'},
        {value: 'JSON_ARRAY'},
        {value: 'NOT'},
    ];

    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);

    // TODO-TRINO: support functions
    // expect(autocompleteResult.suggestFunctions).toEqual(true);
    // expect(autocompleteResult.suggestAggregateFunctions).toEqual(true);

    const columnSuggestion: ColumnSuggestion = {
        tables: [{name: 'catalog.schema.test_table', alias: 't'}],
    };
    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestion);

    const columnAliasSuggestion: ColumnAliasSuggestion[] = [{name: 'count'}, {name: 't1'}];
    expect(autocompleteResult.suggestColumnAliases).toEqual(columnAliasSuggestion);
});
