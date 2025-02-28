import {parseYqlQueryWithCursor, parseYqlQueryWithoutCursor} from '../../../index';
import {KeywordSuggestion} from '../../../../../shared/autocomplete-types';
import {YQLColumnsSuggestion} from '../../../types';

test('should suggest properly after SELECT', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT |');

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'ALL'},
        {value: 'DISTINCT'},
        {value: '*'},
        {value: 'NULL'},
        {value: 'FALSE'},
        {value: 'TRUE'},
        {value: 'EMPTY_ACTION'},
        {value: 'CAST'},
        {value: 'EXISTS'},
        {value: 'CASE'},
        {value: 'VARIANT'},
        {value: 'ENUM'},
        {value: 'CALLABLE'},
        {value: 'BITCAST'},
        {value: 'JSON_VALUE'},
        {value: 'JSON_EXISTS'},
        {value: 'JSON_QUERY'},
        {value: 'NOT'},
        {value: 'OPTIONAL'},
        {value: 'TUPLE'},
        {value: 'STRUCT'},
        {value: 'LIST'},
        {value: 'FLOW'},
        {value: 'DICT'},
        {value: 'SET'},
        {value: 'RESOURCE'},
        {value: 'TAGGED'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
    expect(autocompleteResult.suggestFunctions).toBeTruthy();
    expect(autocompleteResult.suggestUdfs).toBeTruthy();
    expect(autocompleteResult.suggestSimpleTypes).toBeTruthy();
});

test('should suggest properly after FROM', () => {
    const autocompleteResult = parseYqlQueryWithCursor('FROM |');

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'ANY'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
    expect(autocompleteResult.suggestEntity).toEqual(['table', 'view', 'externalTable']);
});

test('should suggest properly after FROM at ID_QUOTED', () => {
    {
        const autocompleteResult = parseYqlQueryWithCursor('FROM `|`');
        expect(autocompleteResult.suggestKeywords).toEqual([]);
    }
    {
        const autocompleteResult = parseYqlQueryWithCursor('FROM `|');
        expect(autocompleteResult.suggestKeywords).toEqual([{value: 'ANY'}]);
    }
    {
        const autocompleteResult = parseYqlQueryWithCursor('FROM ` |');
        expect(autocompleteResult.suggestKeywords).toEqual([{value: 'ANY'}]);
    }
    {
        const autocompleteResult = parseYqlQueryWithCursor('FROM ``|');
        expect(autocompleteResult.suggestKeywords?.length).toBeGreaterThan(0);
    }
    {
        const autocompleteResult = parseYqlQueryWithCursor('FROM `` |');
        expect(autocompleteResult.suggestKeywords?.length).toBeGreaterThan(0);
    }
});

test('should suggest properly after *', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT * |');

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'ASSUME'},
        {value: 'ORDER'},
        {value: 'WINDOW'},
        {value: 'HAVING'},
        {value: 'GROUP'},
        {value: 'WHERE'},
        {value: 'FROM'},
        {value: 'WITHOUT'},
        {value: 'INTO'},
        {value: 'LIMIT'},
        {value: 'UNION'},
        {value: 'INTERSECT'},
        {value: 'EXCEPT'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after FROM', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT * FROM |');

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'ANY'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
    expect(autocompleteResult.suggestEntity).toEqual(['table', 'view', 'externalTable']);
    expect(autocompleteResult.suggestTableFunctions).toBeTruthy();
});

test('should suggest properly after FROM when typing table name', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT * FROM te|');

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'ANY'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
    expect(autocompleteResult.suggestEntity).toEqual(['table', 'view', 'externalTable']);
    expect(autocompleteResult.suggestColumns).toBeFalsy();
});

test('should suggest tables between statements', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        'ALTER TABLE before_table DROP COLUMN id; SELECT * FROM | ; ALTER TABLE after_table DROP COLUMN id;',
    );

    expect(autocompleteResult.suggestEntity).toEqual(['table', 'view', 'externalTable']);
});

test('should suggest properly after table name', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT * FROM test_table |');

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'VIEW'},
        {value: 'WITH'},
        {value: 'TABLESAMPLE'},
        {value: 'SAMPLE'},
        {value: 'AS'},
        {value: 'MATCH_RECOGNIZE'},
        {value: 'FLATTEN'},
        {value: 'NATURAL'},
        {value: 'LEFT'},
        {value: 'RIGHT'},
        {value: 'EXCLUSION'},
        {value: 'FULL'},
        {value: 'OUTER'},
        {value: 'JOIN'},
        {value: 'INNER'},
        {value: 'CROSS'},
        {value: 'ASSUME'},
        {value: 'ORDER'},
        {value: 'WINDOW'},
        {value: 'HAVING'},
        {value: 'GROUP'},
        {value: 'WHERE'},
        {value: 'INTO'},
        {value: 'LIMIT'},
        {value: 'UNION'},
        {value: 'INTERSECT'},
        {value: 'EXCEPT'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest table hints after WITH', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT * FROM test_table WITH |');
    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'COLUMNS'}, {value: 'SCHEMA'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
    expect(autocompleteResult.suggestTableHints).toEqual('select_stmt');
});

test('should suggest table name for column', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT | FROM test_table');
    const columnSuggestions: YQLColumnsSuggestion = {tables: [{name: 'test_table'}], all: true};

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest table name for column between statements', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        'ALTER TABLE before_table DROP COLUMN id; SELECT | FROM test_table ; ALTER TABLE after_table DROP COLUMN id;',
    );
    const columnSuggestions: YQLColumnsSuggestion = {tables: [{name: 'test_table'}], all: true};

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest table name and alias for column', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT | FROM test_table t');
    const columnSuggestions: YQLColumnsSuggestion = {
        tables: [{name: 'test_table', alias: 't'}],
        all: true,
    };

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest table name and alias (with AS) for column', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT | FROM test_table AS t');
    const columnSuggestions: YQLColumnsSuggestion = {
        tables: [{name: 'test_table', alias: 't'}],
        all: true,
    };

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest table name and alias for second column', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT id, | FROM test_table AS t');
    const columnSuggestions: YQLColumnsSuggestion = {tables: [{name: 'test_table', alias: 't'}]};

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest table name and alias for second column if first equals to keyword', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT key, | FROM test_table AS t');
    const columnSuggestions: YQLColumnsSuggestion = {tables: [{name: 'test_table', alias: 't'}]};

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest multiple table names for column', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT | FROM test_table_1, test_table_2');
    const columnSuggestions: YQLColumnsSuggestion = {
        tables: [{name: 'test_table_1'}, {name: 'test_table_2'}],
        all: true,
    };

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest multiple table names for column between statements', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        'ALTER TABLE before_table DROP COLUMN id; SELECT | FROM test_table_1, test_table_2 ; ALTER TABLE after_table DROP COLUMN id;',
    );
    const columnSuggestions: YQLColumnsSuggestion = {
        tables: [{name: 'test_table_1'}, {name: 'test_table_2'}],
        all: true,
    };

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest multiple table names and aliases for column', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        'SELECT | FROM test_table_1 t1, test_table_2 t2',
    );
    const columnSuggestions: YQLColumnsSuggestion = {
        tables: [
            {name: 'test_table_1', alias: 't1'},
            {name: 'test_table_2', alias: 't2'},
        ],
        all: true,
    };

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest multiple table names and aliases (with AS) for column', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        'SELECT | FROM test_table_1 AS t1, test_table_2 AS t2',
    );
    const columnSuggestions: YQLColumnsSuggestion = {
        tables: [
            {name: 'test_table_1', alias: 't1'},
            {name: 'test_table_2', alias: 't2'},
        ],
        all: true,
    };

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest properly after HAVING', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT * FROM test_table as t HAVING |');

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'NULL'},
        {value: 'FALSE'},
        {value: 'TRUE'},
        {value: 'EMPTY_ACTION'},
        {value: 'CAST'},
        {value: 'EXISTS'},
        {value: 'CASE'},
        {value: 'VARIANT'},
        {value: 'ENUM'},
        {value: 'CALLABLE'},
        {value: 'BITCAST'},
        {value: 'JSON_VALUE'},
        {value: 'JSON_EXISTS'},
        {value: 'JSON_QUERY'},
        {value: 'NOT'},
        {value: 'OPTIONAL'},
        {value: 'TUPLE'},
        {value: 'STRUCT'},
        {value: 'LIST'},
        {value: 'FLOW'},
        {value: 'DICT'},
        {value: 'SET'},
        {value: 'RESOURCE'},
        {value: 'TAGGED'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
    expect(autocompleteResult.suggestFunctions).toBeTruthy();
    expect(autocompleteResult.suggestSimpleTypes).toBeTruthy();
    expect(autocompleteResult.suggestUdfs).toBeTruthy();
    expect(autocompleteResult.suggestColumns).toBeTruthy();
});

test('should suggest properly after LIMIT', () => {
    const autocompleteResult = parseYqlQueryWithCursor('SELECT * FROM test_table as t LIMIT |');

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'NULL'},
        {value: 'FALSE'},
        {value: 'TRUE'},
        {value: 'EMPTY_ACTION'},
        {value: 'CAST'},
        {value: 'EXISTS'},
        {value: 'CASE'},
        {value: 'VARIANT'},
        {value: 'ENUM'},
        {value: 'CALLABLE'},
        {value: 'BITCAST'},
        {value: 'JSON_VALUE'},
        {value: 'JSON_EXISTS'},
        {value: 'JSON_QUERY'},
        {value: 'NOT'},
        {value: 'OPTIONAL'},
        {value: 'TUPLE'},
        {value: 'STRUCT'},
        {value: 'LIST'},
        {value: 'FLOW'},
        {value: 'DICT'},
        {value: 'SET'},
        {value: 'RESOURCE'},
        {value: 'TAGGED'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
    expect(autocompleteResult.suggestFunctions).toBeTruthy();
    expect(autocompleteResult.suggestSimpleTypes).toBeTruthy();
    expect(autocompleteResult.suggestUdfs).toBeTruthy();
});

test('should suggest tables with inline comment', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        '$foo = "bar"; SELECT * FROM | --SELECT * FROM test_table',
    );
    expect(autocompleteResult.suggestEntity).toEqual(['table', 'view', 'externalTable']);
    expect(autocompleteResult.suggestVariables).toEqual([{name: 'foo'}]);
});

test('should suggest tables with multiline comment', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        'SELECT * FROM | /*SELECT * FROM test_table*/',
    );

    expect(autocompleteResult.suggestEntity).toEqual(['table', 'view', 'externalTable']);
});

test('should not report errors', () => {
    const autocompleteResult = parseYqlQueryWithoutCursor('SELECT c1, c2 FROM test_table;');

    expect(autocompleteResult.errors).toHaveLength(0);
});

test('should suggest variables name for column', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        'DECLARE $prefix AS String; SELECT | FROM test_table',
    );
    const variablesSuggestions = [{name: 'prefix'}];

    expect(autocompleteResult.suggestVariables).toEqual(variablesSuggestions);
});
test('should suggest variables name for table name', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        'DECLARE $prefix AS String; SELECT * FROM |',
    );
    const variablesSuggestions = [{name: 'prefix'}];

    expect(autocompleteResult.suggestVariables).toEqual(variablesSuggestions);
});
test('should suggest variables name as columns', () => {
    const autocompleteResult = parseYqlQueryWithCursor('$prefix, $foo = (2, 3); SELECT |');
    const variablesSuggestions = [{name: 'prefix'}, {name: 'foo'}];

    expect(autocompleteResult.suggestVariables).toEqual(variablesSuggestions);
});

test('should suggest variables name in global scope', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        '$test = 1; DEFINE SUBQUERY $foo($name) AS $baz = 1;\n select * from test_table where bar == $name AND baz == $baz END DEFINE; $baz2 = 2; select |',
    );
    const variablesSuggestions = [{name: 'test'}, {name: 'foo'}, {name: 'baz2'}];

    expect(autocompleteResult.suggestVariables).toEqual(variablesSuggestions);
});

test('should suggest variables name in local scope', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        '$test = 1; DEFINE SUBQUERY $foo($name) AS $baz = 1;\n select | from test_table where bar == $name AND baz == $baz END DEFINE; $baz2 = 2; select ',
    );
    const variablesSuggestions = [{name: 'name'}, {name: 'baz'}];

    expect(autocompleteResult.suggestVariables).toEqual(variablesSuggestions);
});

test('should suggest variables inside lambda', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        '$f = ($y, $z) -> { $prefix = "x"; RETURN | ;}; select ',
    );
    const variablesSuggestions = [{name: 'y'}, {name: 'z'}, {name: 'prefix'}];

    expect(autocompleteResult.suggestVariables).toEqual(variablesSuggestions);
});

test('should suggest variables outside lambda', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        '$foo = "a"; \n$f = ($y) -> { $prefix = "x"; RETURN $prefix;}; select |',
    );
    const variablesSuggestions = [{name: 'foo'}, {name: 'f'}];

    expect(autocompleteResult.suggestVariables).toEqual(variablesSuggestions);
});

test('should suggest columns for subquery in variable', () => {
    const autocompleteResult = parseYqlQueryWithCursor(
        '$foo = select bar from baz; select | from $foo',
    );
    const variablesSuggestions = [{name: 'foo', value: {columns: ['bar']}}];
    const columnSuggestions: YQLColumnsSuggestion = {
        tables: [{name: '$foo'}],
        all: true,
    };
    expect(autocompleteResult.suggestVariables).toEqual(variablesSuggestions);
    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});
