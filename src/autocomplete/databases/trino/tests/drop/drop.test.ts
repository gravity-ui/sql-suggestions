import {KeywordSuggestion, TableOrViewSuggestion} from '../../../../shared/autocomplete-types';
import {parseTrinoQueryWithCursor, parseTrinoQueryWithoutCursor} from '../../index';

test('should suggest keywords after DROP', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('DROP |');
    const keywords: KeywordSuggestion[] = [
        {value: 'ROLE'},
        {value: 'FUNCTION'},
        {value: 'VIEW'},
        {value: 'MATERIALIZED'},
        {value: 'TABLE'},
        {value: 'SCHEMA'},
        {value: 'CATALOG'},
    ];

    expect(autocompleteResult.suggestKeywords).toEqual(keywords);
});

test('should suggest VIEW after DROP MATERIALIZED', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('DROP MATERIALIZED |');
    const keywords: KeywordSuggestion[] = [{value: 'VIEW'}];

    expect(autocompleteResult.suggestKeywords).toEqual(keywords);
});

test('should suggest views after DROP MATERIALIZED VIEW', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('DROP MATERIALIZED VIEW |');

    // TODO-TRINO: decouple views from tables
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest tables after DROP TABLE', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('DROP TABLE |');

    // TODO-TRINO: decouple views from tables
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest views after DROP VIEW', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('DROP VIEW |');

    // TODO-TRINO: decouple views from tables
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest tables after multiple drop statements', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'DROP VIEW catalog.schema.test_view; DROP TABLE |',
    );

    // TODO-TRINO: decouple views from tables
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest views after multiple drop statements', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'DROP TABLE catalog.schema.test_table; DROP VIEW |',
    );

    // TODO-TRINO: decouple views from tables
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should not report error on DROP TABLE', () => {
    const autocompleteResult = parseTrinoQueryWithoutCursor('DROP TABLE catalog.schema.test_table');

    expect(autocompleteResult.errors).toHaveLength(0);
});

test('should not report error on DROP VIEW', () => {
    const autocompleteResult = parseTrinoQueryWithoutCursor('DROP VIEW catalog.schema.test_view');

    expect(autocompleteResult.errors).toHaveLength(0);
});
