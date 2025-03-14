import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

const FIELDS = ['Lead.Status'];

export default class LeadAutoRefresh extends LightningElement {
    @api recordId;
    wiredRecord;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredLead(result) {
        this.wiredRecord = result;
    }

    connectedCallback() {
        setTimeout(() => {
            refreshApex(this.wiredRecord);
        }, 2000); // 2초 후 새로고침 실행
    }
}