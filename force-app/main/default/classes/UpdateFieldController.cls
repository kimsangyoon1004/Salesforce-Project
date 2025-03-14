public with sharing class UpdateFieldController {
  @AuraEnabled
  public static void updateFields(String recordId, Map<String, String> data) {
    try {
      System.debug('class called');
      System.debug('data: ' + data);
      System.debug('recordId: ' + recordId);
      if (String.isEmpty(recordId) || data == null || data.isEmpty()) {
        throw new AuraHandledException('Record ID and data must be provided.');
      }

      // Get the object name dynamically from the recordId
      String objectApiName = getObjectApiName(recordId);

      if (String.isEmpty(objectApiName)) {
        throw new AuraHandledException('Invalid Record ID.');
      }

      // Create a new instance of the SObject
      SObject updatedRecord = Schema.getGlobalDescribe()
        .get(objectApiName)
        .newSObject(recordId);

      for (String fieldName : data.keySet()) {
        Schema.SObjectField field = Schema.getGlobalDescribe()
          .get(objectApiName)
          .getDescribe()
          .fields.getMap()
          .get(fieldName);

        if (field != null) {
          Schema.DisplayType fieldType = field.getDescribe().getType();

          // Convert values based on field type
          Object fieldValue;
          switch on fieldType {
            when DATETIME {
              fieldValue = Datetime.valueOf(data.get(fieldName));
            }
            when DATE {
              fieldValue = Date.valueOf(data.get(fieldName));
            }
            when INTEGER {
              fieldValue = Integer.valueOf(data.get(fieldName));
            }
            when CURRENCY {
              fieldValue = Decimal.valueOf(data.get(fieldName));
            }
            when BOOLEAN {
              fieldValue = Boolean.valueOf(data.get(fieldName));
            }
            when else {
              fieldValue = data.get(fieldName);
            }
          }
          updatedRecord.put(fieldName, fieldValue);
        }
      }

      // Perform the update
      update updatedRecord;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Error updating record: ' + e.getMessage()
      );
    }
  }

  // Helper method to get the object's API name from the record ID
  private static String getObjectApiName(String recordId) {
    try {
      Id idObj = Id.valueOf(recordId);
      return idObj.getSObjectType().getDescribe().getName();
    } catch (Exception e) {
      return null;
    }
  }
}