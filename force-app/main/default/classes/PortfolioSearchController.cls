public with sharing class PortfolioSearchController {
  @AuraEnabled(cacheable=true)
  public static List<CustomPortfolio__c> searchPortfolios(
    String city,
    String district,
    String spaceSize,
    String spaceType,
    List<String> styling
  ) {
    try {
      String stylingQuery = '';
      if (!styling.isEmpty()) {
        List<String> conditions = new List<String>();

        for (String style : styling) {
          conditions.add('\'' + style + '\'');
        }
        stylingQuery =
          'AND Styling__c INCLUDES(' +
          String.join(conditions, ',') +
          ')';
      }
      String sizeQuery = '';
      // if (spaceSize != '') {
      //   sizeQuery = 'AND SpaceSize__c = \'' + spaceSize + '\'';
      // }
      String typeQuery = '';
      // if (spaceType != '') {
      //   typeQuery = 'AND SpaceType__c = \'' + spaceType + '\'';
      // }

      String query =
        'SELECT Id, Name, Title__c, Account__c, Account__r.Name, Body__c,Link__c, SpaceType__c, SpaceSize__c, City__c, District__c, Styling__c ' +
        'FROM CustomPortfolio__c ' +
        'WHERE City__c = :city AND District__c = :district ' +
        // sizeQuery +
        // typeQuery +
        stylingQuery +
        ' LIMIT 10';

      System.debug('Final SOQL Query: ' + query);

      return Database.query(query);
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}