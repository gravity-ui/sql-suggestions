// $antlr-format alignTrailingComments true, columnLimit 150, minEmptyLines 1, maxEmptyLinesToKeep 1, reflowComments false, useTab false
// $antlr-format allowShortRulesOnASingleLine false, allowShortBlocksOnASingleLine true, alignSemicolons hanging, alignColons hanging

parser grammar TrinoParser;

options {
    tokenVocab = TrinoLexer;
}

parse
    : statements? EOF
    ;

statements
    : statement SEMICOLON_?
    | statement SEMICOLON_ statements
    ;

statement
    : rootQuery              # statementDefault
    | USE_ schemaIdentifier  # use
    | USE_ catalogIdentifier # useCatalog
    | CREATE_ CATALOG_ (IF_ NOT_ EXISTS_)? catalog = identifier USING_ connectorIdentifier (
        COMMENT_ string_
    )? (AUTHORIZATION_ principal)? (WITH_ properties)?                        # createCatalog
    | DROP_ CATALOG_ (IF_ EXISTS_)? catalogIdentifier (CASCADE_ | RESTRICT_)? # dropCatalog
    | CREATE_ SCHEMA_ (IF_ NOT_ EXISTS_)? newSchemaIdentifier (AUTHORIZATION_ principal)? (
        WITH_ properties
    )?                                                                      # createSchema
    | DROP_ SCHEMA_ (IF_ EXISTS_)? schemaIdentifier (CASCADE_ | RESTRICT_)? # dropSchema
    | ALTER_ SCHEMA_ schemaIdentifier RENAME_ TO_ identifier                # renameSchema
    | ALTER_ SCHEMA_ schemaIdentifier SET_ AUTHORIZATION_ principal         # setSchemaAuthorization
    | CREATE_ (OR_ REPLACE_)? TABLE_ (IF_ NOT_ EXISTS_)? newTableIdentifier columnAliases? (
        COMMENT_ string_
    )? (WITH_ properties)? AS_ (rootQuery | LPAREN_ rootQuery RPAREN_) (WITH_ (NO_)? DATA_)? # createTableAsSelect
    | CREATE_ (OR_ REPLACE_)? TABLE_ (IF_ NOT_ EXISTS_)? newTableIdentifier LPAREN_ tableElement (
        COMMA_ tableElement
    )* RPAREN_ (COMMENT_ string_)? (WITH_ properties)?                                                                     # createTable
    | DROP_ TABLE_ (IF_ EXISTS_)? tableIdentifier                                                                          # dropTable
    | insertStatement                                                                                                      # insert
    | updateStatement                                                                                                      # update
    | DELETE_ FROM_ tableIdentifier (WHERE_ booleanExpression)?                                                            # delete
    | TRUNCATE_ TABLE_ tableIdentifier                                                                                     # truncateTable
    | COMMENT_ ON_ TABLE_ tableIdentifier IS_ (string_ | NULL_)                                                            # commentTable
    | COMMENT_ ON_ VIEW_ viewIdentifier IS_ (string_ | NULL_)                                                              # commentView
    | COMMENT_ ON_ COLUMN_ qualifiedName IS_ (string_ | NULL_)                                                             # commentColumn
    | ALTER_ TABLE_ (IF_ EXISTS_)? tableIdentifier RENAME_ TO_ to = qualifiedName                                          # renameTable
    | ALTER_ TABLE_ (IF_ EXISTS_)? tableIdentifier ADD_ COLUMN_ (IF_ NOT_ EXISTS_)? column = columnDefinition              # addColumn
    | ALTER_ TABLE_ (IF_ EXISTS_)? tableIdentifier RENAME_ COLUMN_ (IF_ EXISTS_)? from = qualifiedName TO_ to = identifier # renameColumn
    | ALTER_ TABLE_ (IF_ EXISTS_)? tableIdentifier DROP_ COLUMN_ (IF_ EXISTS_)? column = qualifiedName                     # dropColumn
    | ALTER_ TABLE_ (IF_ EXISTS_)? tableIdentifier ALTER_ COLUMN_ columnName = qualifiedName SET_ DATA_ TYPE_ type         # setColumnType
    | ALTER_ TABLE_ tableIdentifier SET_ AUTHORIZATION_ principal                                                          # setTableAuthorization
    | ALTER_ TABLE_ tableIdentifier SET_ PROPERTIES_ propertyAssignments                                                   # setTableProperties
    | ALTER_ TABLE_ tableIdentifier EXECUTE_ procedureName = identifier (
        LPAREN_ (callArgument (COMMA_ callArgument)*)? RPAREN_
    )? (WHERE_ where = booleanExpression)?         # tableExecute
    | ANALYZE_ tableIdentifier (WITH_ properties)? # analyze
    | CREATE_ (OR_ REPLACE_)? MATERIALIZED_ VIEW_ (IF_ NOT_ EXISTS_)? newViewIdentifier (
        GRACE_ PERIOD_ interval
    )? (COMMENT_ string_)? (WITH_ properties)? AS_ rootQuery # createMaterializedView
    | CREATE_ (OR_ REPLACE_)? VIEW_ newViewIdentifier (COMMENT_ string_)? (
        SECURITY_ (DEFINER_ | INVOKER_)
    )? AS_ rootQuery                                                                          # createView
    | REFRESH_ MATERIALIZED_ VIEW_ viewIdentifier                                             # refreshMaterializedView
    | DROP_ MATERIALIZED_ VIEW_ (IF_ EXISTS_)? viewIdentifier                                 # dropMaterializedView
    | ALTER_ MATERIALIZED_ VIEW_ (IF_ EXISTS_)? viewIdentifier RENAME_ TO_ to = qualifiedName # renameMaterializedView
    | ALTER_ MATERIALIZED_ VIEW_ viewIdentifier SET_ PROPERTIES_ propertyAssignments          # setMaterializedViewProperties
    | DROP_ VIEW_ (IF_ EXISTS_)? viewIdentifier                                               # dropView
    | ALTER_ VIEW_ viewIdentifier RENAME_ TO_ to = qualifiedName                              # renameView
    | ALTER_ VIEW_ viewIdentifier SET_ AUTHORIZATION_ principal                               # setViewAuthorization
    | CALL_ qualifiedName LPAREN_ (callArgument (COMMA_ callArgument)*)? RPAREN_              # call
    | CREATE_ (OR_ REPLACE_)? functionSpecification                                           # createFunction
    | DROP_ FUNCTION_ (IF_ EXISTS_)? functionDeclaration                                      # dropFunction
    | CREATE_ ROLE_ identifier (WITH_ ADMIN_ grantor)? (IN_ catalog = catalogIdentifier)?     # createRole
    | DROP_ ROLE_ roleIdentifier (IN_ catalog = catalogIdentifier)?                           # dropRole
    | GRANT_ roleIdentifierList TO_ principal (COMMA_ principal)* (WITH_ ADMIN_ OPTION_)? (
        GRANTED_ BY_ grantor
    )? (IN_ catalog = catalogIdentifier)? # grantRoles
    | REVOKE_ (ADMIN_ OPTION_ FOR_)? roleIdentifierList FROM_ principal (COMMA_ principal)* (
        GRANTED_ BY_ grantor
    )? (IN_ catalog = catalogIdentifier)?                                           # revokeRoles
    | SET_ ROLE_ (ALL_ | NONE_ | roleIdentifier) (IN_ catalog = catalogIdentifier)? # setRole
    | GRANT_ (privilege (COMMA_ privilege)* | ALL_ PRIVILEGES_) ON_ (
        SCHEMA_? schemaIdentifier
        | TABLE_? tableIdentifier
    ) TO_ grantee = principal (WITH_ GRANT_ OPTION_)? # grant
    | DENY_ (privilege (COMMA_ privilege)* | ALL_ PRIVILEGES_) ON_ (
        SCHEMA_? schemaIdentifier
        | TABLE_? tableIdentifier
    ) TO_ grantee = principal # deny
    | REVOKE_ (GRANT_ OPTION_ FOR_)? (privilege (COMMA_ privilege)* | ALL_ PRIVILEGES_) ON_ (
        SCHEMA_? schemaIdentifier
        | TABLE_? tableIdentifier
    ) FROM_ grantee = principal                                                   # revoke
    | SHOW_ GRANTS_ (ON_ TABLE_? tableIdentifier)?                                # showGrants
    | EXPLAIN_ (LPAREN_ explainOption (COMMA_ explainOption)* RPAREN_)? statement # explain
    | EXPLAIN_ ANALYZE_ VERBOSE_? statement                                       # explainAnalyze
    | SHOW_ CREATE_ TABLE_ tableIdentifier                                        # showCreateTable
    | SHOW_ CREATE_ SCHEMA_ schemaIdentifier                                      # showCreateSchema
    | SHOW_ CREATE_ VIEW_ viewIdentifier                                          # showCreateView
    | SHOW_ CREATE_ MATERIALIZED_ VIEW_ viewIdentifier                            # showCreateMaterializedView
    | SHOW_ TABLES_ ((FROM_ | IN_) schemaIdentifier)? (
        LIKE_ pattern = string_ (ESCAPE_ escape = string_)?
    )? # showTables
    | SHOW_ SCHEMAS_ ((FROM_ | IN_) catalogIdentifier)? (
        LIKE_ pattern = string_ (ESCAPE_ escape = string_)?
    )?                                                                       # showSchemas
    | SHOW_ CATALOGS_ (LIKE_ pattern = string_ (ESCAPE_ escape = string_)?)? # showCatalogs
    | SHOW_ COLUMNS_ (FROM_ | IN_) tableIdentifier? (
        LIKE_ pattern = string_ (ESCAPE_ escape = string_)?
    )?                                                          # showColumns
    | SHOW_ STATS_ FOR_ tableIdentifier                         # showStats
    | SHOW_ STATS_ FOR_ LPAREN_ rootQuery RPAREN_               # showStatsForQuery
    | SHOW_ CURRENT_? ROLES_ ((FROM_ | IN_) catalogIdentifier)? # showRoles
    | SHOW_ ROLE_ GRANTS_ ((FROM_ | IN_) catalogIdentifier)?    # showRoleGrants
    | DESCRIBE_ tableIdentifier                                 # showColumns
    | DESC_ tableIdentifier                                     # showColumns
    | SHOW_ FUNCTIONS_ ((FROM_ | IN_) schemaIdentifier)? (
        LIKE_ pattern = string_ (ESCAPE_ escape = string_)?
    )?                                                                                               # showFunctions
    | SHOW_ SESSION_ (LIKE_ pattern = string_ (ESCAPE_ escape = string_)?)?                          # showSession
    | SET_ SESSION_ AUTHORIZATION_ authorizationUser                                                 # setSessionAuthorization
    | RESET_ SESSION_ AUTHORIZATION_                                                                 # resetSessionAuthorization
    | SET_ SESSION_ qualifiedName EQ_ expression                                                     # setSession
    | RESET_ SESSION_ qualifiedName                                                                  # resetSession
    | START_ TRANSACTION_ (transactionMode (COMMA_ transactionMode)*)?                               # startTransaction
    | COMMIT_ WORK_?                                                                                 # commit
    | ROLLBACK_ WORK_?                                                                               # rollback
    | PREPARE_ identifier FROM_ statement                                                            # prepare
    | DEALLOCATE_ PREPARE_ identifier                                                                # deallocate
    | EXECUTE_ identifier (USING_ expression (COMMA_ expression)*)?                                  # execute
    | EXECUTE_ IMMEDIATE_ string_ (USING_ expression (COMMA_ expression)*)?                          # executeImmediate
    | DESCRIBE_ INPUT_ identifier                                                                    # describeInput
    | DESCRIBE_ OUTPUT_ identifier                                                                   # describeOutput
    | SET_ PATH_ pathSpecification                                                                   # setPath
    | SET_ TIME_ ZONE_ (LOCAL_ | expression)                                                         # setTimeZone
    | MERGE_ INTO_ tableIdentifier (AS_? aliasIdentifier)? USING_ relation ON_ expression mergeCase+ # merge
    ;

insertStatement
    : INSERT_ INTO_ tableReference columnAliases? rootQuery
    ;

updateStatement
    : UPDATE_ tableReference SET_ updateAssignment (COMMA_ updateAssignment)* (
        WHERE_ where = booleanExpression
    )?
    ;

rootQuery
    : withFunction? query
    ;

withFunction
    : WITH_ functionSpecification (COMMA_ functionSpecification)*
    ;

query
    : with? queryNoWith
    ;

with
    : WITH_ RECURSIVE_? namedQuery (COMMA_ namedQuery)*
    ;

tableElement
    : columnDefinition
    | likeClause
    ;

columnDefinition
    : identifier type (NOT_ NULL_)? (COMMENT_ string_)? (WITH_ properties)?
    ;

likeClause
    : LIKE_ qualifiedName (optionType = (INCLUDING_ | EXCLUDING_) PROPERTIES_)?
    ;

properties
    : LPAREN_ propertyAssignments RPAREN_
    ;

propertyAssignments
    : property (COMMA_ property)*
    ;

property
    : identifier EQ_ propertyValue
    ;

propertyValue
    : DEFAULT_   # defaultPropertyValue
    | expression # nonDefaultPropertyValue
    ;

queryNoWith
    : queryTerm (ORDER_ BY_ sortItem (COMMA_ sortItem)*)? (
        OFFSET_ offset = rowCount (ROW_ | ROWS_)?
    )? (
        LIMIT_ limit = limitRowCount
        | FETCH_ (FIRST_ | NEXT_) (fetchFirst = rowCount)? (ROW_ | ROWS_) (ONLY_ | WITH_ TIES_)
    )?
    ;

limitRowCount
    : ALL_
    | rowCount
    ;

rowCount
    : INTEGER_VALUE_
    | QUESTION_MARK_
    ;

queryTerm
    : queryPrimary                                                                    # queryTermDefault
    | left = queryTerm operator = INTERSECT_ setQuantifier? right = queryTerm         # setOperation
    | left = queryTerm operator = (UNION_ | EXCEPT_) setQuantifier? right = queryTerm # setOperation
    ;

queryPrimary
    : querySpecification                      # queryPrimaryDefault
    | TABLE_ qualifiedName                    # table
    | VALUES_ expression (COMMA_ expression)* # inlineTable
    | LPAREN_ queryNoWith RPAREN_             # subquery
    ;

sortItem
    : expression ordering = (ASC_ | DESC_)? (NULLS_ nullOrdering = (FIRST_ | LAST_))?
    ;

querySpecification
    : SELECT_ setQuantifier? selectItem (COMMA_ selectItem)* fromClause? (
        WHERE_ where = booleanExpression
    )? (GROUP_ BY_ groupBy)? (HAVING_ having = booleanExpression)? (
        WINDOW_ windowDefinition (COMMA_ windowDefinition)*
    )?
    ;

fromClause
    : FROM_ relation (COMMA_ relation)*
    ;

groupBy
    : setQuantifier? groupingElement (COMMA_ groupingElement)*
    ;

groupingElement
    : groupingSet                                                       # singleGroupingSet
    | ROLLUP_ LPAREN_ (expression (COMMA_ expression)*)? RPAREN_        # rollup
    | CUBE_ LPAREN_ (expression (COMMA_ expression)*)? RPAREN_          # cube
    | GROUPING_ SETS_ LPAREN_ groupingSet (COMMA_ groupingSet)* RPAREN_ # multipleGroupingSets
    ;

groupingSet
    : LPAREN_ (expression (COMMA_ expression)*)? RPAREN_
    | expression
    ;

windowDefinition
    : name = identifier AS_ LPAREN_ windowSpecification RPAREN_
    ;

windowSpecification
    : (existingWindowName = identifier)? (
        PARTITION_ BY_ partition += expression (COMMA_ partition += expression)*
    )? (ORDER_ BY_ sortItem (COMMA_ sortItem)*)? windowFrame?
    ;

namedQuery
    : name = identifier (columnAliases)? AS_ LPAREN_ query RPAREN_
    ;

setQuantifier
    : DISTINCT_
    | ALL_
    ;

selectItem
    : ASTERISK_
    | expression (AS_? aliasIdentifier)?
    | primaryExpression DOT_ ASTERISK_ (AS_ columnAliases)?
    ;

relation
    : left = relation (
        CROSS_ JOIN_ right = sampledRelation
        | joinType JOIN_ rightRelation = relation joinCriteria
        | NATURAL_ joinType JOIN_ right = sampledRelation
    )                 # joinRelation
    | sampledRelation # relationDefault
    ;

joinType
    : INNER_?
    | (LEFT_ | RIGHT_ | FULL_) OUTER_?
    ;

joinCriteria
    : ON_ booleanExpression
    | USING_ LPAREN_ tableIdentifier (COMMA_ tableIdentifier)* RPAREN_
    ;

sampledRelation
    : tableReference
    | patternRecognition (TABLESAMPLE_ sampleType LPAREN_ percentage = expression RPAREN_)?
    ;

sampleType
    : BERNOULLI_
    | SYSTEM_
    ;

trimsSpecification
    : LEADING_
    | TRAILING_
    | BOTH_
    ;

listAggOverflowBehavior
    : ERROR_
    | TRUNCATE_ string_? listaggCountIndication
    ;

listaggCountIndication
    : (WITH_ | WITHOUT_) COUNT_
    ;

patternRecognition
    : aliasedRelation (
        MATCH_RECOGNIZE_ LPAREN_ (
            PARTITION_ BY_ partition += expression (COMMA_ partition += expression)*
        )? (ORDER_ BY_ sortItem (COMMA_ sortItem)*)? (
            MEASURES_ measureDefinition (COMMA_ measureDefinition)*
        )? rowsPerMatch? (AFTER_ MATCH_ skipTo)? (INITIAL_ | SEEK_)? PATTERN_ LPAREN_ rowPattern RPAREN_ (
            SUBSET_ subsetDefinition (COMMA_ subsetDefinition)*
        )? DEFINE_ variableDefinition (COMMA_ variableDefinition)* RPAREN_ (
            AS_? aliasIdentifier columnAliases?
        )?
    )?
    ;

measureDefinition
    : expression AS_ aliasIdentifier
    ;

rowsPerMatch
    : ONE_ ROW_ PER_ MATCH_
    | ALL_ ROWS_ PER_ MATCH_ emptyMatchHandling?
    ;

emptyMatchHandling
    : SHOW_ EMPTY_ MATCHES_
    | OMIT_ EMPTY_ MATCHES_
    | WITH_ UNMATCHED_ ROWS_
    ;

skipTo
    : SKIP_ (TO_ (NEXT_ ROW_ | (FIRST_ | LAST_)? identifier) | PAST_ LAST_ ROW_)
    ;

subsetDefinition
    : name = identifier EQ_ LPAREN_ union += identifier (COMMA_ union += identifier)* RPAREN_
    ;

variableDefinition
    : identifier AS_ aliasIdentifier
    ;

aliasedRelation
    : relationPrimary (AS_? aliasIdentifier columnAliases?)?
    ;

columnAliases
    : LPAREN_ columnIdentifier (COMMA_ columnIdentifier)* RPAREN_
    ;

relationPrimary
    : qualifiedName queryPeriod?                                                   # tableName
    | LPAREN_ query RPAREN_                                                        # subqueryRelation
    | UNNEST_ LPAREN_ expression (COMMA_ expression)* RPAREN_ (WITH_ ORDINALITY_)? # unnest
    | LATERAL_ LPAREN_ query RPAREN_                                               # lateral
    | TABLE_ LPAREN_ tableFunctionCall RPAREN_                                     # tableFunctionInvocation
    | LPAREN_ relation RPAREN_                                                     # parenthesizedRelation
    ;

tableFunctionCall
    : qualifiedName LPAREN_ (tableFunctionArgument (COMMA_ tableFunctionArgument)*)? (
        COPARTITION_ copartitionTables (COMMA_ copartitionTables)*
    )? RPAREN_
    ;

tableFunctionArgument
    : (identifier RDOUBLEARROW_)? (
        tableArgument
        | descriptorArgument
        | expression
    ) // descriptor before expression to avoid parsing descriptor as a function call
    ;

tableArgument
    : tableArgumentRelation (
        PARTITION_ BY_ (LPAREN_ (expression (COMMA_ expression)*)? RPAREN_ | expression)
    )? (PRUNE_ WHEN_ EMPTY_ | KEEP_ WHEN_ EMPTY_)? (
        ORDER_ BY_ (LPAREN_ sortItem (COMMA_ sortItem)* RPAREN_ | sortItem)
    )?
    ;

tableArgumentRelation
    : TABLE_ LPAREN_ tableIdentifier RPAREN_ (AS_? aliasIdentifier columnAliases?)? # tableArgumentTable
    | TABLE_ LPAREN_ query RPAREN_ (AS_? aliasIdentifier columnAliases?)?           # tableArgumentQuery
    ;

descriptorArgument
    : DESCRIPTOR_ LPAREN_ descriptorField (COMMA_ descriptorField)* RPAREN_
    | CAST_ LPAREN_ NULL_ AS_ DESCRIPTOR_ RPAREN_
    ;

descriptorField
    : identifier type?
    ;

copartitionTables
    : LPAREN_ qualifiedName COMMA_ qualifiedName (COMMA_ qualifiedName)* RPAREN_
    ;

expression
    : booleanExpression
    ;

booleanExpression
    : valueExpression predicate_?              # predicated
    | NOT_ booleanExpression                   # logicalNot
    | booleanExpression AND_ booleanExpression # and
    | booleanExpression OR_ booleanExpression  # or
    ;

// workaround for https://github.com/antlr/antlr4/issues/780
predicate_
    : comparisonOperator right = valueExpression                                # comparison
    | comparisonOperator comparisonQuantifier LPAREN_ query RPAREN_             # quantifiedComparison
    | NOT_? BETWEEN_ lower = valueExpression AND_ upper = valueExpression       # between
    | NOT_? IN_ LPAREN_ expression (COMMA_ expression)* RPAREN_                 # inList
    | NOT_? IN_ LPAREN_ query RPAREN_                                           # inSubquery
    | NOT_? LIKE_ pattern = valueExpression (ESCAPE_ escape = valueExpression)? # like
    | IS_ NOT_? NULL_                                                           # nullPredicate
    | IS_ NOT_? DISTINCT_ FROM_ right = valueExpression                         # distinctFrom
    ;

valueExpression
    : primaryExpression                                                                         # valueExpressionDefault
    | valueExpression AT_ timeZoneSpecifier                                                     # atTimeZone
    | operator = (MINUS_ | PLUS_) valueExpression                                               # arithmeticUnary
    | left = valueExpression operator = (ASTERISK_ | SLASH_ | PERCENT_) right = valueExpression # arithmeticBinary
    | left = valueExpression operator = (PLUS_ | MINUS_) right = valueExpression                # arithmeticBinary
    | left = valueExpression CONCAT_ right = valueExpression                                    # concatenation
    ;

primaryExpression
    : NULL_                                                         # nullLiteral
    | interval                                                      # intervalLiteral
    | identifier string_                                            # typeConstructor
    | DOUBLE_ PRECISION_ string_                                    # typeConstructor
    | number                                                        # numericLiteral
    | booleanValue                                                  # booleanLiteral
    | string_                                                       # stringLiteral
    | BINARY_LITERAL_                                               # binaryLiteral
    | QUESTION_MARK_                                                # parameter
    | POSITION_ LPAREN_ valueExpression IN_ valueExpression RPAREN_ # position
    | LPAREN_ expression (COMMA_ expression)+ RPAREN_               # rowConstructor
    | ROW_ LPAREN_ expression (COMMA_ expression)* RPAREN_          # rowConstructor
    | name = LISTAGG_ LPAREN_ setQuantifier? expression (COMMA_ string_)? (
        ON_ OVERFLOW_ listAggOverflowBehavior
    )? RPAREN_ (WITHIN_ GROUP_ LPAREN_ ORDER_ BY_ sortItem (COMMA_ sortItem)* RPAREN_) filter?         # listagg
    | processingMode? qualifiedName LPAREN_ (label = identifier DOT_)? ASTERISK_ RPAREN_ filter? over? # functionCall
    | processingMode? qualifiedName LPAREN_ (setQuantifier? expression (COMMA_ expression)*)? (
        ORDER_ BY_ sortItem (COMMA_ sortItem)*
    )? RPAREN_ filter? (nullTreatment? over)?                               # functionCall
    | identifier over                                                       # measure
    | identifier RARROW_ expression                                         # lambda
    | LPAREN_ (identifier (COMMA_ identifier)*)? RPAREN_ RARROW_ expression # lambda
    | LPAREN_ query RPAREN_                                                 # subqueryExpression
    // This is an extension to ANSI_ SQL, which considers EXISTS_ to be a <boolean expression>
    | EXISTS_ LPAREN_ query RPAREN_                                                                               # exists
    | CASE_ operand = expression whenClause+ (ELSE_ elseExpression = expression)? END_                            # simpleCase
    | CASE_ whenClause+ (ELSE_ elseExpression = expression)? END_                                                 # searchedCase
    | CAST_ LPAREN_ expression AS_ type RPAREN_                                                                   # cast
    | TRY_CAST_ LPAREN_ expression AS_ type RPAREN_                                                               # cast
    | ARRAY_ LSQUARE_ (expression (COMMA_ expression)*)? RSQUARE_                                                 # arrayConstructor
    | value = primaryExpression LSQUARE_ index = valueExpression RSQUARE_                                         # subscript
    | columnIdentifier                                                                                            # column
    | base_ = primaryExpression DOT_ fieldName = identifier                                                       # dereference
    | name = CURRENT_DATE_                                                                                        # specialDateTimeFunction
    | name = CURRENT_TIME_ (LPAREN_ precision = INTEGER_VALUE_ RPAREN_)?                                          # specialDateTimeFunction
    | name = CURRENT_TIMESTAMP_ (LPAREN_ precision = INTEGER_VALUE_ RPAREN_)?                                     # specialDateTimeFunction
    | name = LOCALTIME_ (LPAREN_ precision = INTEGER_VALUE_ RPAREN_)?                                             # specialDateTimeFunction
    | name = LOCALTIMESTAMP_ (LPAREN_ precision = INTEGER_VALUE_ RPAREN_)?                                        # specialDateTimeFunction
    | name = CURRENT_USER_                                                                                        # currentUser
    | name = CURRENT_CATALOG_                                                                                     # currentCatalog
    | name = CURRENT_SCHEMA_                                                                                      # currentSchema
    | name = CURRENT_PATH_                                                                                        # currentPath
    | TRIM_ LPAREN_ (trimsSpecification? trimChar = valueExpression? FROM_)? trimSource = valueExpression RPAREN_ # trim
    | TRIM_ LPAREN_ trimSource = valueExpression COMMA_ trimChar = valueExpression RPAREN_                        # trim
    | SUBSTRING_ LPAREN_ valueExpression FROM_ valueExpression (FOR_ valueExpression)? RPAREN_                    # substring
    | NORMALIZE_ LPAREN_ valueExpression (COMMA_ normalForm)? RPAREN_                                             # normalize
    | EXTRACT_ LPAREN_ identifier FROM_ valueExpression RPAREN_                                                   # extract
    | LPAREN_ expression RPAREN_                                                                                  # parenthesizedExpression
    | GROUPING_ LPAREN_ (qualifiedName (COMMA_ qualifiedName)*)? RPAREN_                                          # groupingOperation
    | JSON_EXISTS_ LPAREN_ jsonPathInvocation (jsonExistsErrorBehavior ON_ ERROR_)? RPAREN_                       # jsonExists
    | JSON_VALUE_ LPAREN_ jsonPathInvocation (RETURNING_ type)? (
        emptyBehavior = jsonValueBehavior ON_ EMPTY_
    )? (errorBehavior = jsonValueBehavior ON_ ERROR_)? RPAREN_ # jsonValue
    | JSON_QUERY_ LPAREN_ jsonPathInvocation (RETURNING_ type (FORMAT_ jsonRepresentation)?)? (
        jsonQueryWrapperBehavior WRAPPER_
    )? ((KEEP_ | OMIT_) QUOTES_ (ON_ SCALAR_ TEXT_STRING_)?)? (
        emptyBehavior = jsonQueryBehavior ON_ EMPTY_
    )? (errorBehavior = jsonQueryBehavior ON_ ERROR_)? RPAREN_ # jsonQuery
    | JSON_OBJECT_ LPAREN_ (
        jsonObjectMember (COMMA_ jsonObjectMember)* (NULL_ ON_ NULL_ | ABSENT_ ON_ NULL_)? (
            WITH_ UNIQUE_ KEYS_?
            | WITHOUT_ UNIQUE_ KEYS_?
        )?
    )? (RETURNING_ type (FORMAT_ jsonRepresentation)?)? RPAREN_ # jsonObject
    | JSON_ARRAY_ LPAREN_ (
        jsonValueExpression (COMMA_ jsonValueExpression)* (NULL_ ON_ NULL_ | ABSENT_ ON_ NULL_)?
    )? (RETURNING_ type (FORMAT_ jsonRepresentation)?)? RPAREN_ # jsonArray
    ;

jsonPathInvocation
    : jsonValueExpression COMMA_ path = string_ (PASSING_ jsonArgument (COMMA_ jsonArgument)*)?
    ;

jsonValueExpression
    : expression (FORMAT_ jsonRepresentation)?
    ;

jsonRepresentation
    : JSON_ (ENCODING_ (UTF8_ | UTF16_ | UTF32_))? // TODO_ add implementation-defined JSON_ representation option
    ;

jsonArgument
    : jsonValueExpression AS_ aliasIdentifier
    ;

jsonExistsErrorBehavior
    : TRUE_
    | FALSE_
    | UNKNOWN_
    | ERROR_
    ;

jsonValueBehavior
    : ERROR_
    | NULL_
    | DEFAULT_ expression
    ;

jsonQueryWrapperBehavior
    : WITHOUT_ ARRAY_?
    | WITH_ (CONDITIONAL_ | UNCONDITIONAL_)? ARRAY_?
    ;

jsonQueryBehavior
    : ERROR_
    | NULL_
    | EMPTY_ (ARRAY_ | OBJECT_)
    ;

jsonObjectMember
    : KEY_? expression VALUE_ jsonValueExpression
    | expression COLON_ jsonValueExpression
    ;

processingMode
    : RUNNING_
    | FINAL_
    ;

nullTreatment
    : IGNORE_ NULLS_
    | RESPECT_ NULLS_
    ;

// renamed from "string" to avoid golang name conflict
string_
    : STRING_                             # basicStringLiteral
    | UNICODE_STRING_ (UESCAPE_ STRING_)? # unicodeStringLiteral
    ;

timeZoneSpecifier
    : TIME_ ZONE_ interval # timeZoneInterval
    | TIME_ ZONE_ string_  # timeZoneString
    ;

comparisonOperator
    : EQ_
    | NEQ_
    | LT_
    | LTE_
    | GT_
    | GTE_
    ;

comparisonQuantifier
    : ALL_
    | SOME_
    | ANY_
    ;

booleanValue
    : TRUE_
    | FALSE_
    ;

interval
    : INTERVAL_ sign = (PLUS_ | MINUS_)? string_ from = intervalField (TO_ to = intervalField)?
    ;

intervalField
    : YEAR_
    | MONTH_
    | DAY_
    | HOUR_
    | MINUTE_
    | SECOND_
    ;

normalForm
    : NFD_
    | NFC_
    | NFKD_
    | NFKC_
    ;

type
    : ROW_ LPAREN_ rowField (COMMA_ rowField)* RPAREN_                                        # rowType
    | INTERVAL_ from = intervalField (TO_ to = intervalField)?                                # intervalType
    | base_ = TIMESTAMP_ (LPAREN_ precision = typeParameter RPAREN_)? (WITHOUT_ TIME_ ZONE_)? # dateTimeType
    | base_ = TIMESTAMP_ (LPAREN_ precision = typeParameter RPAREN_)? WITH_ TIME_ ZONE_       # dateTimeType
    | base_ = TIME_ (LPAREN_ precision = typeParameter RPAREN_)? (WITHOUT_ TIME_ ZONE_)?      # dateTimeType
    | base_ = TIME_ (LPAREN_ precision = typeParameter RPAREN_)? WITH_ TIME_ ZONE_            # dateTimeType
    | DOUBLE_ PRECISION_                                                                      # doublePrecisionType
    | ARRAY_ LT_ type GT_                                                                     # legacyArrayType
    | MAP_ LT_ keyType = type COMMA_ valueType = type GT_                                     # legacyMapType
    | type ARRAY_ (LSQUARE_ INTEGER_VALUE_ RSQUARE_)?                                         # arrayType
    | identifier (LPAREN_ typeParameter (COMMA_ typeParameter)* RPAREN_)?                     # genericType
    ;

rowField
    : type
    | identifier type
    ;

typeParameter
    : INTEGER_VALUE_
    | type
    ;

whenClause
    : WHEN_ condition = expression THEN_ result = expression
    ;

filter
    : FILTER_ LPAREN_ WHERE_ booleanExpression RPAREN_
    ;

mergeCase
    : WHEN_ MATCHED_ (AND_ condition = expression)? THEN_ UPDATE_ SET_ targets += identifier EQ_ values += expression (
        COMMA_ targets += identifier EQ_ values += expression
    )*                                                            # mergeUpdate
    | WHEN_ MATCHED_ (AND_ condition = expression)? THEN_ DELETE_ # mergeDelete
    | WHEN_ NOT_ MATCHED_ (AND_ condition = expression)? THEN_ INSERT_ (
        LPAREN_ targets += identifier (COMMA_ targets += identifier)* RPAREN_
    )? VALUES_ LPAREN_ values += expression (COMMA_ values += expression)* RPAREN_ # mergeInsert
    ;

over
    : OVER_ (windowName = identifier | LPAREN_ windowSpecification RPAREN_)
    ;

windowFrame
    : (MEASURES_ measureDefinition (COMMA_ measureDefinition)*)? frameExtent (AFTER_ MATCH_ skipTo)? (
        INITIAL_
        | SEEK_
    )? (PATTERN_ LPAREN_ rowPattern RPAREN_)? (SUBSET_ subsetDefinition (COMMA_ subsetDefinition)*)? (
        DEFINE_ variableDefinition (COMMA_ variableDefinition)*
    )?
    ;

// renamed start and stop to avoid Dart name conflict
frameExtent
    : frameType = RANGE_ start_ = frameBound
    | frameType = ROWS_ start_ = frameBound
    | frameType = GROUPS_ start_ = frameBound
    | frameType = RANGE_ BETWEEN_ start_ = frameBound AND_ end_ = frameBound
    | frameType = ROWS_ BETWEEN_ start_ = frameBound AND_ end_ = frameBound
    | frameType = GROUPS_ BETWEEN_ start_ = frameBound AND_ end_ = frameBound
    ;

frameBound
    : UNBOUNDED_ boundType = PRECEDING_                # unboundedFrame
    | UNBOUNDED_ boundType = FOLLOWING_                # unboundedFrame
    | CURRENT_ ROW_                                    # currentRowBound
    | expression boundType = (PRECEDING_ | FOLLOWING_) # boundedFrame
    ;

rowPattern
    : patternPrimary patternQuantifier? # quantifiedPrimary
    | rowPattern rowPattern             # patternConcatenation
    | rowPattern VBAR_ rowPattern       # patternAlternation
    ;

patternPrimary
    : identifier                                               # patternVariable
    | LPAREN_ RPAREN_                                          # emptyPattern
    | PERMUTE_ LPAREN_ rowPattern (COMMA_ rowPattern)* RPAREN_ # patternPermutation
    | LPAREN_ rowPattern RPAREN_                               # groupedPattern
    | CARET_                                                   # partitionStartAnchor
    | DOLLAR_                                                  # partitionEndAnchor
    | LCURLYHYPHEN_ rowPattern RCURLYHYPHEN_                   # excludedPattern
    ;

patternQuantifier
    : ASTERISK_ (reluctant = QUESTION_MARK_)?                                # zeroOrMoreQuantifier
    | PLUS_ (reluctant = QUESTION_MARK_)?                                    # oneOrMoreQuantifier
    | QUESTION_MARK_ (reluctant = QUESTION_MARK_)?                           # zeroOrOneQuantifier
    | LCURLY_ exactly = INTEGER_VALUE_ RCURLY_ (reluctant = QUESTION_MARK_)? # rangeQuantifier
    | LCURLY_ (atLeast = INTEGER_VALUE_)? COMMA_ (atMost = INTEGER_VALUE_)? RCURLY_ (
        reluctant = QUESTION_MARK_
    )? # rangeQuantifier
    ;

updateAssignment
    : columnIdentifier EQ_ expression
    ;

explainOption
    : FORMAT_ value = (TEXT_ | GRAPHVIZ_ | JSON_)               # explainFormat
    | TYPE_ value = (LOGICAL_ | DISTRIBUTED_ | VALIDATE_ | IO_) # explainType
    ;

transactionMode
    : ISOLATION_ LEVEL_ levelOfIsolation  # isolationLevel
    | READ_ accessMode = (ONLY_ | WRITE_) # transactionAccessMode
    ;

levelOfIsolation
    : READ_ UNCOMMITTED_ # readUncommitted
    | READ_ COMMITTED_   # readCommitted
    | REPEATABLE_ READ_  # repeatableRead
    | SERIALIZABLE_      # serializable
    ;

callArgument
    : expression                          # positionalArgument
    | identifier RDOUBLEARROW_ expression # namedArgument
    ;

pathElement
    : identifier DOT_ identifier # qualifiedArgument
    | identifier                 # unqualifiedArgument
    ;

pathSpecification
    : pathElement (COMMA_ pathElement)*
    ;

functionSpecification
    : FUNCTION_ functionDeclaration returnsClause routineCharacteristic* controlStatement
    ;

functionDeclaration
    : qualifiedName LPAREN_ (parameterDeclaration (COMMA_ parameterDeclaration)*)? RPAREN_
    ;

parameterDeclaration
    : identifier? type
    ;

returnsClause
    : RETURNS_ type
    ;

routineCharacteristic
    : LANGUAGE_ identifier            # languageCharacteristic
    | NOT_? DETERMINISTIC_            # deterministicCharacteristic
    | RETURNS_ NULL_ ON_ NULL_ INPUT_ # returnsNullOnNullInputCharacteristic
    | CALLED_ ON_ NULL_ INPUT_        # calledOnNullInputCharacteristic
    | SECURITY_ (DEFINER_ | INVOKER_) # securityCharacteristic
    | COMMENT_ string_                # commentCharacteristic
    ;

controlStatement
    : RETURN_ valueExpression                                                              # returnStatement
    | SET_ identifier EQ_ expression                                                       # assignmentStatement
    | CASE_ expression caseStatementWhenClause+ elseClause? END_ CASE_                     # simpleCaseStatement
    | CASE_ caseStatementWhenClause+ elseClause? END_ CASE_                                # searchedCaseStatement
    | IF_ expression THEN_ sqlStatementList elseIfClause* elseClause? END_ IF_             # ifStatement
    | ITERATE_ identifier                                                                  # iterateStatement
    | LEAVE_ identifier                                                                    # leaveStatement
    | BEGIN_ (variableDeclaration SEMICOLON_)* sqlStatementList? END_                      # compoundStatement
    | (label = identifier COLON_)? LOOP_ sqlStatementList END_ LOOP_                       # loopStatement
    | (label = identifier COLON_)? WHILE_ expression DO_ sqlStatementList END_ WHILE_      # whileStatement
    | (label = identifier COLON_)? REPEAT_ sqlStatementList UNTIL_ expression END_ REPEAT_ # repeatStatement
    ;

caseStatementWhenClause
    : WHEN_ expression THEN_ sqlStatementList
    ;

elseIfClause
    : ELSEIF_ expression THEN_ sqlStatementList
    ;

elseClause
    : ELSE_ sqlStatementList
    ;

variableDeclaration
    : DECLARE_ identifier (COMMA_ identifier)* type (DEFAULT_ valueExpression)?
    ;

sqlStatementList
    : (controlStatement SEMICOLON_)+
    ;

privilege
    : CREATE_
    | SELECT_
    | DELETE_
    | INSERT_
    | UPDATE_
    ;

qualifiedName
    : identifier (DOT_ identifier)*
    ;

queryPeriod
    : FOR_ rangeType AS_ OF_ end = valueExpression
    ;

rangeType
    : TIMESTAMP_
    | VERSION_
    ;

grantor
    : principal     # specifiedPrincipal
    | CURRENT_USER_ # currentUserGrantor
    | CURRENT_ROLE_ # currentRoleGrantor
    ;

principal
    : identifier       # unspecifiedPrincipal
    | USER_ identifier # userPrincipal
    | ROLE_ identifier # rolePrincipal
    ;

roleIdentifierList
    : roleIdentifier (COMMA_ roleIdentifier)*
    ;

identifier
    : IDENTIFIER_            # unquotedIdentifier
    | QUOTED_IDENTIFIER_     # quotedIdentifier
    | nonReserved            # unquotedIdentifier
    | BACKQUOTED_IDENTIFIER_ # backQuotedIdentifier
    | DIGIT_IDENTIFIER_      # digitIdentifier
    ;

catalogIdentifier
    : identifier
    ;

schemaIdentifier
    : catalogIdentifier DOT_ identifier
    ;

tableReference
    : tableIdentifier (AS_? aliasIdentifier)?
    ;

tableIdentifier
    : schemaIdentifier DOT_ identifier
    ;

viewIdentifier
    : tableIdentifier
    ;

columnIdentifier
    : identifier
    ;

aliasIdentifier
    : identifier
    ;

newSchemaIdentifier
    : identifier DOT_ identifier
    ;

newTableIdentifier
    : newSchemaIdentifier DOT_ identifier
    ;

newViewIdentifier
    : newTableIdentifier
    ;

roleIdentifier
    : identifier
    ;

connectorIdentifier
    : identifier
    ;

number
    : MINUS_? DECIMAL_VALUE_ # decimalLiteral
    | MINUS_? DOUBLE_VALUE_  # doubleLiteral
    | MINUS_? INTEGER_VALUE_ # integerLiteral
    ;

authorizationUser
    : identifier # identifierUser
    | string_    # stringUser
    ;

nonReserved
    // IMPORTANT: this rule must only contain tokens. Nested rules are not supported. See SqlParser.exitNonReserved
    : ABSENT_
    | ADD_
    | ADMIN_
    | AFTER_
    | ALL_
    | ANALYZE_
    | ANY_
    | ARRAY_
    | ASC_
    | AT_
    | AUTHORIZATION_
    | BEGIN_
    | BERNOULLI_
    | BOTH_
    | CALL_
    | CALLED_
    | CASCADE_
    | CATALOG_
    | CATALOGS_
    | COLUMN_
    | COLUMNS_
    | COMMENT_
    | COMMIT_
    | COMMITTED_
    | CONDITIONAL_
    | COPARTITION_
    | COUNT_
    | CURRENT_
    | DATA_
    | DATE_
    | DAY_
    | DECLARE_
    | DEFAULT_
    | DEFINE_
    | DEFINER_
    | DENY_
    | DESC_
    | DESCRIPTOR_
    | DETERMINISTIC_
    | DISTRIBUTED_
    | DO_
    | DOUBLE_
    | ELSEIF_
    | EMPTY_
    | ENCODING_
    | ERROR_
    | EXCLUDING_
    | EXPLAIN_
    | FETCH_
    | FILTER_
    | FINAL_
    | FIRST_
    | FOLLOWING_
    | FORMAT_
    | FUNCTION_
    | FUNCTIONS_
    | GRACE_
    | GRANT_
    | GRANTED_
    | GRANTS_
    | GRAPHVIZ_
    | GROUPS_
    | HOUR_
    | IF_
    | IGNORE_
    | IMMEDIATE_
    | INCLUDING_
    | INITIAL_
    | INPUT_
    | INTERVAL_
    | INVOKER_
    | IO_
    | ITERATE_
    | ISOLATION_
    | JSON_
    | KEEP_
    | KEY_
    | KEYS_
    | LANGUAGE_
    | LAST_
    | LATERAL_
    | LEADING_
    | LEAVE_
    | LEVEL_
    | LIMIT_
    | LOCAL_
    | LOGICAL_
    | LOOP_
    | MAP_
    | MATCH_
    | MATCHED_
    | MATCHES_
    | MATCH_RECOGNIZE_
    | MATERIALIZED_
    | MEASURES_
    | MERGE_
    | MINUTE_
    | MONTH_
    | NESTED_
    | NEXT_
    | NFC_
    | NFD_
    | NFKC_
    | NFKD_
    | NO_
    | NONE_
    | NULLIF_
    | NULLS_
    | OBJECT_
    | OF_
    | OFFSET_
    | OMIT_
    | ONE_
    | ONLY_
    | OPTION_
    | ORDINALITY_
    | OUTPUT_
    | OVER_
    | OVERFLOW_
    | PARTITION_
    | PARTITIONS_
    | PASSING_
    | PAST_
    | PATH_
    | PATTERN_
    | PER_
    | PERIOD_
    | PERMUTE_
    | PLAN_
    | POSITION_
    | PRECEDING_
    | PRECISION_
    | PRIVILEGES_
    | PROPERTIES_
    | PRUNE_
    | QUOTES_
    | RANGE_
    | READ_
    | REFRESH_
    | RENAME_
    | REPEAT_
    | REPEATABLE_
    | REPLACE_
    | RESET_
    | RESPECT_
    | RESTRICT_
    | RETURN_
    | RETURNING_
    | RETURNS_
    | REVOKE_
    | ROLE_
    | ROLES_
    | ROLLBACK_
    | ROW_
    | ROWS_
    | RUNNING_
    | SCALAR_
    | SCHEMA_
    | SCHEMAS_
    | SECOND_
    | SECURITY_
    | SEEK_
    | SERIALIZABLE_
    | SESSION_
    | SET_
    | SETS_
    | SHOW_
    | SOME_
    | START_
    | STATS_
    | SUBSET_
    | SUBSTRING_
    | SYSTEM_
    | TABLES_
    | TABLESAMPLE_
    | TEXT_
    | TEXT_STRING_
    | TIES_
    | TIME_
    | TIMESTAMP_
    | TO_
    | TRAILING_
    | TRANSACTION_
    | TRUNCATE_
    | TRY_CAST_
    | TYPE_
    | UNBOUNDED_
    | UNCOMMITTED_
    | UNCONDITIONAL_
    | UNIQUE_
    | UNKNOWN_
    | UNMATCHED_
    | UNTIL_
    | UPDATE_
    | USE_
    | USER_
    | UTF16_
    | UTF32_
    | UTF8_
    | VALIDATE_
    | VALUE_
    | VERBOSE_
    | VERSION_
    | VIEW_
    | WHILE_
    | WINDOW_
    | WITHIN_
    | WITHOUT_
    | WORK_
    | WRAPPER_
    | WRITE_
    | YEAR_
    | ZONE_
    ;