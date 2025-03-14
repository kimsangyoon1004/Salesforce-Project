public with sharing class WebToAnythingController {
  @AuraEnabled
  public static String createRecord(
    String objectApiName,
    Map<String, String> data
  ) {
    System.debug('class called to create record');

    if (String.isEmpty(objectApiName) || data == null) {
      throw new AuraHandledException('Invalid parameters');
    }

    Schema.SObjectType sObjectType = Schema.getGlobalDescribe()
      .get(objectApiName);

    // ❌ Prevent null dereferencing
    if (sObjectType == null) {
      throw new AuraHandledException('Invalid object: ' + objectApiName);
    }

    // ✅ CHECK CREATE PERMISSIONS BEFORE INSERT
    if (!sObjectType.getDescribe().isCreateable()) {
      throw new AuraHandledException(
        'You do not have permission to create ' + objectApiName
      );
    }

    SObject newRecord = sObjectType.newSObject();
    Database.DMLOptions dmo = new Database.DMLOptions();
    dmo.assignmentRuleHeader.useDefaultRule = true;

    for (String key : data.keySet()) {
      if (objectApiName == 'Lead') {
        if (key == 'Field8__c') {
          String datetimeString = data.get(key);
          Datetime dateValue = Datetime.valueOf(datetimeString);
          newRecord.put(key, dateValue);
        } else if (key == 'AccountId') {
          newRecord.put('Description', data.get(key));
          dmo.assignmentRuleHeader.useDefaultRule = false;
        } else {
          newRecord.put(key, data.get(key));
        }
      } else {
        newRecord.put(key, data.get(key));
      }
    }
    newRecord.setOptions(dmo);
    try {
      insert newRecord;
      System.debug('🔥 Successfully inserted record: ' + newRecord);
      return newRecord.Id;
    } catch (Exception e) {
      System.debug('❌ Insert Failed: ' + e.getMessage());
      throw new AuraHandledException('Insert failed: ' + e.getMessage());
    }
  }
}