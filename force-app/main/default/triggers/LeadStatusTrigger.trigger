trigger LeadStatusTrigger on Lead (after update) {
    List<Id> leadIds = new List<Id>();

    for (Lead lead : Trigger.new) {
        Lead oldLead = Trigger.oldMap.get(lead.Id);

        // ✅ 상태가 "1차 심사"로 변경될 때만 OCR 실행
        if (lead.Status == '1차 심사' && oldLead.Status != '1차 심사') {
            leadIds.add(lead.Id);
        }
    }

    if (!leadIds.isEmpty()) {
        System.debug('🔍 OCR 실행 대상 리드 ID: ' + leadIds);
        OCRProcessor.executeOCR(leadIds); // ✅ OCR 실행
    }
}
