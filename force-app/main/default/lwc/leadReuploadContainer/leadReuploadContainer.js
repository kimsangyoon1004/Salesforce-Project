import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class LeadReuploadContainer extends LightningElement {
    leadId;

    @wire(CurrentPageReference)
    getPageRef(pageRef) {
        if (pageRef && pageRef.state.leadId) {
            this.leadId = pageRef.state.leadId;
        }
    }
}