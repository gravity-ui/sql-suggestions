// Please note that the code below is the modified code distributed on the terms, mentioned below.
// The copyright for the changes belongs to YANDEX LLC.
//
// Copyright 2023 YANDEX LLC
//
// Licensed under the Apache License, Version 2.0 (the "License")
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under
// the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
// either express or implied. See the License for the specific language governing permissions
// and limitations under the License.

SqlStatement
 : ExplainSqlStatement
 ;

SqlStatement_EDIT
 : ExplainSqlStatement_EDIT
 ;

ExplainSqlStatement
 : 'EXPLAIN' DataDefinition
 | 'EXPLAIN' DataManipulation
 | 'EXPLAIN' QuerySpecification
 ;

ExplainSqlStatement_EDIT
 : 'EXPLAIN' 'CURSOR'
    {
      parser.suggestDdlAndDmlKeywords();
      parser.suggestTemplates();
    }
 | 'EXPLAIN' DataDefinition_EDIT
 | 'EXPLAIN' DataManipulation_EDIT
 | 'EXPLAIN' QuerySpecification_EDIT
 ;
