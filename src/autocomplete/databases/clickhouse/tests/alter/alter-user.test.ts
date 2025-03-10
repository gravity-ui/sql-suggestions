import {parseClickHouseQueryWithCursor, parseClickHouseQueryWithoutCursor} from '../../index';
import {KeywordSuggestion} from '../../../../shared/autocomplete-types';

test('should suggest properly after USER', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor('ALTER USER |');

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'IF'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after user name', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor('ALTER USER test_user |');

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'SETTINGS'},
        {value: 'GRANTEES'},
        {value: 'DEFAULT'},
        {value: 'VALID'},
        {value: 'HOST'},
        {value: 'ADD'},
        {value: 'DROP'},
        {value: 'NOT'},
        {value: 'IDENTIFIED'},
        {value: 'ON'},
        {value: 'RENAME'},
        {value: 'FORMAT'},
        {value: 'INTO'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after NOT', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor('ALTER USER test_user NOT |');

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'IDENTIFIED'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after IDENTIFIED', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor('ALTER USER test_user IDENTIFIED |');

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'WITH'}, {value: 'BY'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after IF', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor('ALTER USER IF |');

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'SETTINGS'},
        {value: 'GRANTEES'},
        {value: 'DEFAULT'},
        {value: 'VALID'},
        {value: 'HOST'},
        {value: 'ADD'},
        {value: 'DROP'},
        {value: 'NOT'},
        {value: 'IDENTIFIED'},
        {value: 'ON'},
        {value: 'RENAME'},
        {value: 'EXISTS'},
        {value: 'FORMAT'},
        {value: 'INTO'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after RENAME', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor('ALTER USER test_user RENAME |');

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'TO'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after IDENTIFIED', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor('ALTER USER test_user IDENTIFIED |');

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'WITH'}, {value: 'BY'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after WITH', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        'ALTER USER test_user IDENTIFIED WITH |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'NO_PASSWORD'},
        {value: 'LDAP'},
        {value: 'KERBEROS'},
        {value: 'SSL_CERTIFICATE'},
        {value: 'SSH_KEY'},
        {value: 'HTTP'},
        {value: 'PLAINTEXT_PASSWORD'},
        {value: 'SHA256_PASSWORD'},
        {value: 'SHA256_HASH'},
        {value: 'DOUBLE_SHA1_PASSWORD'},
        {value: 'DOUBLE_SHA1_HASH'},
        {value: 'BCRYPT_PASSWORD'},
        {value: 'BCRYPT_HASH'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after user identification declaration', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        'ALTER USER test_user IDENTIFIED WITH NO_PASSWORD |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'SETTINGS'},
        {value: 'GRANTEES'},
        {value: 'DEFAULT'},
        {value: 'VALID'},
        {value: 'HOST'},
        {value: 'ADD'},
        {value: 'DROP'},
        {value: 'FORMAT'},
        {value: 'INTO'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after DEFAULT', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        'ALTER USER test_user IDENTIFIED WITH NO_PASSWORD DEFAULT |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'ROLE'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after SETTINGS', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        'ALTER USER test_user IDENTIFIED WITH NO_PASSWORD SETTINGS |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'PROFILE'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after settings expression', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        "ALTER USER test_user IDENTIFIED WITH NO_PASSWORD SETTINGS test_variable = 'test_value' |",
    );

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'READONLY'},
        {value: 'WRITABLE'},
        {value: 'CONST'},
        {value: 'CHANGEABLE_IN_READONLY'},
        {value: 'MAX'},
        {value: 'MIN'},
        {value: 'FORMAT'},
        {value: 'INTO'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after HOST', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        'ALTER USER test_user IDENTIFIED WITH NO_PASSWORD HOST |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'LOCAL'},
        {value: 'ANY'},
        {value: 'NONE'},
        {value: 'LIKE'},
        {value: 'NAME'},
        {value: 'REGEXP'},
        {value: 'IP'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after grantees identifier', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        'ALTER USER test_user IDENTIFIED WITH NO_PASSWORD GRANTEES test_user |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'EXCEPT'},
        {value: 'SETTINGS'},
        {value: 'FORMAT'},
        {value: 'INTO'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after LDAP', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        'ALTER USER test_user IDENTIFIED WITH LDAP |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'SERVER'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after KERBEROS', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        'ALTER USER test_user IDENTIFIED WITH KERBEROS |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'REALM'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after SSL_CERTIFICATE', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        'ALTER USER test_user IDENTIFIED WITH SSL_CERTIFICATE |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'SAN'}, {value: 'CN'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after SSH_KEY', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        'ALTER USER test_user IDENTIFIED WITH SSH_KEY |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'BY'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after BY', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        'ALTER USER test_user IDENTIFIED WITH SSH_KEY BY |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'KEY'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after key identifier', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        "ALTER USER test_user IDENTIFIED WITH SSH_KEY BY KEY 'test_key' |",
    );

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'TYPE'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest next ssh_key identification properly after comma', () => {
    const autocompleteResult = parseClickHouseQueryWithCursor(
        "ALTER USER test_user IDENTIFIED WITH SSH_KEY BY KEY 'test_key' TYPE 'test_type', |",
    );

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'KEY'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should not report errors', () => {
    const autocompleteResult = parseClickHouseQueryWithoutCursor(`
        ALTER USER test_user;
        ALTER USER test_user NOT IDENTIFIED;
        ALTER USER test_user IDENTIFIED BY 'test_password';
        ALTER USER test_user IDENTIFIED WITH LDAP SERVER 'test_server';
        ALTER USER test_user IDENTIFIED WITH NO_PASSWORD;
        ALTER USER test_user IDENTIFIED WITH PLAINTEXT_PASSWORD BY 'test_password';
        ALTER USER test_user IDENTIFIED WITH SHA256_PASSWORD BY 'test_password';
        ALTER USER test_user IDENTIFIED WITH SHA256_HASH BY 'test_password';
        ALTER USER test_user IDENTIFIED WITH DOUBLE_SHA1_PASSWORD BY 'test_password';
        ALTER USER test_user IDENTIFIED WITH DOUBLE_SHA1_HASH BY 'test_password';
        ALTER USER test_user IDENTIFIED WITH BCRYPT_PASSWORD BY 'test_password';
        ALTER USER test_user IDENTIFIED WITH BCRYPT_HASH BY 'test_password';
        ALTER USER test_user IDENTIFIED WITH KERBEROS REALM 'test_string';
        ALTER USER test_user IDENTIFIED WITH SSL_CERTIFICATE CN 'test_string';
        ALTER USER test_user IDENTIFIED WITH SSL_CERTIFICATE SAN 'test_string';
        ALTER USER test_user IDENTIFIED WITH SSH_KEY BY KEY 'test_key1' TYPE 'test_type';
        ALTER USER test_user IDENTIFIED WITH SSH_KEY BY KEY 'test_key1' TYPE 'test_type1', KEY 'test_key2' TYPE 'test_type2';
        ALTER USER test_user IDENTIFIED WITH HTTP SERVER 'test_server';
        ALTER USER test_user IDENTIFIED WITH HTTP SERVER 'test_server' scheme 'test_scheme';
    `);

    expect(autocompleteResult.errors).toHaveLength(0);
});

test('should not report errors on extended statements', () => {
    const autocompleteResult = parseClickHouseQueryWithoutCursor(`
        ALTER USER
            test_user1 RENAME TO test_user2
        NOT IDENTIFIED
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user1, test_user2, test_user3
        IDENTIFIED BY 'test_password'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH LDAP SERVER 'test_server'
        ADD HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH NO_PASSWORD
        DROP HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH PLAINTEXT_PASSWORD BY 'test_password'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH SHA256_PASSWORD BY 'test_password'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH SHA256_HASH BY 'test_password'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH DOUBLE_SHA1_PASSWORD BY 'test_password'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH DOUBLE_SHA1_HASH BY 'test_password'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH BCRYPT_PASSWORD BY 'test_password'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH BCRYPT_HASH BY 'test_password'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH KERBEROS REALM 'test_string'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH SSL_CERTIFICATE CN 'test_string'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH SSL_CERTIFICATE SAN 'test_string'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH SSH_KEY BY KEY 'test_key1' TYPE 'test_type'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH SSH_KEY BY KEY 'test_key1' TYPE 'test_type1', KEY 'test_key2' TYPE 'test_type2'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH HTTP SERVER 'test_server'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;

        ALTER USER
            test_user
        IDENTIFIED WITH HTTP SERVER 'test_server' scheme 'test_scheme'
        HOST NAME 'test_name', REGEXP 'test_regexp', IP 'test_ip', LIKE 'test_string', ANY, NONE, LOCAL
        VALID UNTIL '2025-01-01'
        DEFAULT ROLE test_role1, test_role2
        GRANTEES test_user1, test_role2, ANY, NONE EXCEPT test_user1, test_role2
        SETTINGS
            test_variable1 = 'test_value1' MIN = 'test_value_min1' MAX = 'test_value_max1' READONLY,
            test_variable2 = 'test_value2' MIN 'test_value_min2' MAX 'test_value_max2' WRITABLE,
            PROFILE 'test_profile'
        ;
    `);

    expect(autocompleteResult.errors).toHaveLength(0);
});
