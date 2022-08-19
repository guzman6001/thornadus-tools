import React, {Component} from 'react';
import {ContactService}   from './ContactService';
import {DataTable}        from 'primereact/datatable';
import {Column}           from 'primereact/column';
import {Panel}            from 'primereact/panel';
import {Menubar}          from 'primereact/menubar';
import {Dialog}           from 'primereact/dialog';
import {InputText}        from 'primereact/inputtext';
import {Button}           from 'primereact/button';
import {Growl}            from 'primereact/growl';

import "../App.css";
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import "react-datepicker/dist/react-datepicker.css";
import 'primereact/resources/themes/nova-light/theme.css';

 export class ContactView extends Component{
  constructor(){
    super();

    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    let prevMonth = (month === 0) ? 11 : month - 1;
    let prevYear = (prevMonth === 11) ? year - 1 : year;
    let nextMonth = (month === 11) ? 0 : month + 1;
    let nextYear = (nextMonth === 0) ? year + 1 : year;

    this.minDate = new Date();
    this.minDate.setMonth(prevMonth);
    this.minDate.setFullYear(prevYear);

    this.maxDate = new Date();
    this.maxDate.setMonth(nextMonth);
    this.maxDate.setFullYear(nextYear);

    this.invalidDates = [today];

    this.dateTemplate = this.dateTemplate.bind(this);

    this.state = {
      visible : false,
      
      contactVisible : false,
      historyVisible: false,

      contactHistoryList: null,

      contact: {
        id: null,
        firstName: "",
        lastName: "",
        email: "",
        phone:""
      },
      selectedContact : {

      }

    };
    

    // Menu Options:

    this.contactPreOptions = [
      {
        label : 'New Contact',
        icon  : 'pi pi-fw pi-plus',
        command : () => {this.showSaveContactDialog()}
      }
    ];
    this.contactPostOptions = [
      {
        label : 'View Changes History',
        icon  : 'pi pi-fw pi-eye',
        command : () => {this.showHistoryDialog()}
      },
      {
        label : 'Edit Selected Contact',
        icon  : 'pi pi-fw pi-pencil',
        command : () => {this.showEditContactDialog()}
      },
      {
        label : 'Delete Selected Contact',
        icon  : 'pi pi-fw pi-trash',
        command : () => {this.deleteContact()}
      }
    ];

    this.contactService = new ContactService();
    this.saveContact = this.saveContact.bind(this);
    this.deleteContact = this.deleteContact.bind(this);

    this.footerContact = (
      <div>
        <Button label="Guardar" icon="pi pi-check" onClick={this.saveContact} />
      </div>
    );
   
  }



  componentDidMount(){
    this.contactService.getAll().then(data => this.setState({contacts: data}));
  }



  saveContact() {
    this.contactService.save(this.state.contact).then(data => {
      this.setState({
        contactVisible : false,
        contact: {
          id: null,
          firstName: "",
          lastName: "",
          email: "",
          phone:""
        }
      });
      this.growl.show({severity: 'success', summary: 'Success', detail: 'Contact Added.'});
      this.contactService.getAll().then(data => this.setState({contacts: data}))
    })
  }

  deleteContact() {
    if(window.confirm("Are you sure?")) {
      this.contactService.delete(this.state.selectedContact.id).then(data => {
        this.growl.show({severity: 'success', summary: 'Success', detail: 'Contact was deleted'});
        this.contactService.getAll().then(data => this.setState({contacts: data}));
      });
    }
  }

  dateTemplate(date) {
    if (date.day > 10 && date.day < 15) {
        return (
            <strong style={{ textDecoration: 'line-through' }}>{date.day}</strong>
        );
    }
    return date.day;
  }

  

  render(){

    return (
      <div>
             <Menubar model={this.contactPreOptions}/>
            <br/>
            <Panel header="Contact List">
            <DataTable value={this.state.contacts} paginator={true} rows={5} selectionMode="radiobutton" selection={this.state.selectedContact} onSelectionChange={e => this.setState({selectedContact: e.value})}>
              <Column selectionMode="single" headerStyle={{width: '3em'}}></Column>
              <Column field="id" header="ID"></Column>
              <Column field="firstName" header="First Name"></Column>
              <Column field="lastName" header="Last Name"></Column>
              <Column field="email" header="Email"></Column>
              <Column field="phone" header="Phone"></Column>
            </DataTable>
            <Menubar model={this.contactPostOptions}/>
            </Panel>

        <Dialog id="contactDialog" header="Contact" visible={this.state.contactVisible} style={{width: '400px'}} footer={this.footerContact} modal={true} onHide={() => this.setState({contactVisible: false})}>
            <form id="contact-form">
              <span className="p-float-label">
                <InputText value={this.state.contact.firstName} style={{width : '100%'}} id="firstName" onChange={(e) => {
                    let val = e.target.value;
                    this.setState(prevState => {
                        let contact = Object.assign({}, prevState.contact);
                        contact.firstName = val;
                        return { contact };
                    })}
                  } />
                <label htmlFor="firstName">First Name</label>
              </span>
              <br/>
              <span className="p-float-label">
                <InputText value={this.state.contact.lastName} style={{width : '100%'}} id="lastName" onChange={(e) => {
                    let val = e.target.value;
                    this.setState(prevState => {
                        let contact = Object.assign({}, prevState.contact);
                        contact.lastName = val;
                        return { contact };
                    })}
                  } />
                <label htmlFor="lastName">Last Name</label>
              </span>
              <br/>
              <span className="p-float-label">
                <InputText value={this.state.contact.email} style={{width : '100%'}} id="email" onChange={(e) => {
                    let val = e.target.value;
                    this.setState(prevState => {
                        let contact = Object.assign({}, prevState.contact);
                        contact.email = val;
                        return { contact };
                    })}
                  } />
                <label htmlFor="email">Email</label>
              </span>
              <br/>
              <span className="p-float-label">
                <InputText value={this.state.contact.phone} style={{width : '100%'}} id="phone" onChange={(e) => {
                    let val = e.target.value;
                    this.setState(prevState => {
                        let contact = Object.assign({}, prevState.contact);
                        contact.phone = val;
                        return { contact };
                    })}
                  } />
                <label htmlFor="phone">Phone</label>
              </span>
            </form>
        </Dialog>

        <Dialog id="historyDialog" header="Changes History" visible={this.state.historyVisible} style={{width: '80%'}} modal={true} onHide={() => this.setState({historyVisible: false})}>
        <Panel header="History Changes Log">
            <DataTable value={this.state.contactHistoryList} paginator={true} rows={5}>
              <Column field="id" header="ID"></Column>
              <Column field="firstName" header="First Name"></Column>
              <Column field="lastName" header="Last Name"></Column>
              <Column field="email" header="Email"></Column>
              <Column field="phone" header="Phone"></Column>
              <Column field="modificationDate" header="Modification Date"></Column>
            </DataTable>
            </Panel>
        </Dialog>






        


        <Growl ref={(el) => this.growl = el} />
      </div>
    );
  }

  /* View Method */
  showHistoryDialog(){
    this.setState({
      historyVisible: true,
      contactHistoryList: this.state.selectedContact.history
    });
  }

  showSaveContactDialog() {
    this.setState({
      contactVisible : true,
      contact : {
        id:         null,
        firstName:  "",
        lastName:   "",
        email:      "",
        phone:      ""
      }
    });
    document.getElementById('contact-form').reset();
  }

  /* Edit Methods */
  showEditContactDialog() {
    this.setState({
      contactVisible : true,
      contact : {
        id:         this.state.selectedContact.id,
        firstName:  this.state.selectedContact.firstName,
        lastName:   this.state.selectedContact.lastName,
        email:      this.state.selectedContact.email,
        phone:      this.state.selectedContact.phone
      }
    })
  }


}
