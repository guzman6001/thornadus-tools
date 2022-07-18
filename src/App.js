import React, {Component} from 'react';
import {EventService}     from './service/EventService';
import {MetricService}    from './service/MetricService';
import {ContactService}   from './service/ContactService';
import {DataTable}        from 'primereact/datatable';
import {Column}           from 'primereact/column';
import {Panel}            from 'primereact/panel';
import {Menubar}          from 'primereact/menubar';
import {Calendar}         from 'primereact/calendar';
import {Dialog}           from 'primereact/dialog';
import {InputText}        from 'primereact/inputtext';
import {Button}           from 'primereact/button';
import {Growl}            from 'primereact/growl';
import {TabView, TabPanel} from 'primereact/tabview';

import {
  Charts,
  ChartContainer,
  ChartRow,
  YAxis,
  Baseline,
  LineChart
} from "react-timeseries-charts";
import { TimeSeries } from "pondjs";

import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek"

import { Calendar as PanelCalendar, dateFnsLocalizer } from 'react-big-calendar'

import "./App.css";
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import "react-datepicker/dist/react-datepicker.css";
import 'primereact/resources/themes/nova-light/theme.css';
import "react-big-calendar/lib/css/react-big-calendar.css";

const data = require("./usd_vs_euro.json");
// const points = data.widget[0].data.reverse();
const series = new TimeSeries({
  name: "Metrics Timeline",
  columns: ["time", "value"],
  points: data.widget[0].data.reverse()
});

const style = {
  value: {
      stroke: "#a02c2c",
      opacity: 0.2
  }
};

const baselineStyleLite = {
  line: {
      stroke: "steelblue",
      strokeWidth: 1,
      opacity: 0.5
  },
  label: {
      fill: "steelblue"
  }
};

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default class App extends Component{
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
      metricVisible : false,
      contactVisible : false,
      eventVisible: false,
      historyVisible: false,
      calendarEvents: null,

      contactHistoryList: null,

      metric: {
        id: null,
        name: "",
        metricValue: "",
        metricTime: ""
      },
      selectedMetric : {

      },
      event: {
        id: null,
        title: "",
        description: "",
        startDate: "",
        endDate: ""
      },
      selectedEvent : {
        id: null,
        title: "",
        description: "",
        startDate: "",
        endDate: ""
      },
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
    this.metricPreOptions = [
      {
        label : 'New Metric',
        icon  : 'pi pi-fw pi-plus',
        command : () => {this.showSaveMetricDialog()}
      }
    ];
    this.eventPreOptions = [
      {
        label : 'New Event',
        icon  : 'pi pi-fw pi-plus',
        command : () => {this.showSaveEventDialog()}
      }
    ];
    this.eventPostOptions = [
      {
        label : 'Edit Selected Event',
        icon  : 'pi pi-fw pi-pencil',
        command : () => {this.showEditEventDialog()}
      },
      {
        label : 'Delete Selected Event',
        icon  : 'pi pi-fw pi-trash',
        command : () => {this.deleteEvent()}
      }
    ];
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

    this.eventService   = new EventService();
    this.contactService = new ContactService();
    this.metricService  = new MetricService();
    this.saveContact = this.saveContact.bind(this);
    this.saveEvent  = this.saveEvent.bind(this);
    this.saveMetric = this.saveMetric.bind(this);
    this.deleteContact = this.deleteContact.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);

    this.footerContact = (
      <div>
        <Button label="Guardar" icon="pi pi-check" onClick={this.saveContact} />
      </div>
    );
    this.footerEvent = (
      <div>
        <Button label="Guardar" icon="pi pi-check" onClick={this.saveEvent} />
      </div>
    );
    this.footerMetric = (
      <div>
        <Button label="Guardar" icon="pi pi-check" onClick={this.saveMetric} />
      </div>
    );
  }

  Event({ event }) {
    
    return (
      <span>
        <strong>
            {event.title}
        </strong><br />
            {event.description}
      </span>
    );
  }

  componentDidMount(){
    this.eventService.getAll().then(data => this.setState({events: data}));
    this.contactService.getAll().then(data => this.setState({contacts: data}));
    this.metricService.getAll().then(data => this.setState({metrics: data}));
    this.metricService.getPoints().then(data => this.setState({pointsValue: data}));
  }

  manageEventSelection(event){

    this.growl.show({severity: 'success', summary: 'Selected', detail: event.title});
    this.setState({
      selectedEvent: {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate
      }
    });
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

  saveEvent() {
    this.eventService.save(this.state.event).then(data => {
      this.setState({
        eventVisible : false,
        event: {
          id: null,
          title: "",
          description: "",
          startDate: "",
          endDate: ""
        }
      });
      this.growl.show({severity: 'success', summary: 'Success', detail: 'Event Added.'});
      this.eventService.getAll().then(data => this.setState({events: data}))
    })
  }

  saveMetric() {
    this.metricService.save(this.state.metric).then(data => {
      this.setState({
        metricVisible : false,
        contact: {
          id: null,
          name: "",
          metricValue: "",
          metricTime: ""
        }
      });
      this.growl.show({severity: 'success', summary: 'Success', detail: 'Metric added.'});
      this.metricService.getAll().then(data => this.setState({metrics: data}))
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

  deleteEvent() {
    if(window.confirm("Are you sure?")) {
      this.eventService.delete(this.state.selectedEvent.id).then(data => {
        this.growl.show({severity: 'success', summary: 'Success', detail: 'Event was deleted'});
        this.eventService.getAll().then(data => this.setState({events: data}));
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
    
    if (this.state.pointsValue != null){
       alert( Object.values(this.state.pointsValue));
      // alert(series);
      // series=this.state.pointsValue.data
      
    }
    
    /*
      series = new TimeSeries({
      name: "Time",
      columns: ["time", "value"],
      points: 
    });*/

    return (
      <div style={{width:'80%', margin: '0 auto', marginTop: '20px'}}>
        <h2>Thornadus Tools</h2>
        <TabView className="tabview-header-icon">




          <TabPanel header="Contacts" leftIcon="pi pi-users">
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
          </TabPanel>

          <TabPanel header="Events" leftIcon="pi pi-calendar">
            <Menubar model={this.eventPreOptions}/>
            <PanelCalendar localizer={localizer} 
              events={this.state.events} 
              startAccessor="startDate" 
              selected={this.state.selectedEvent}
              onSelectEvent={event => this.manageEventSelection(event)}
              endAccessor="endDate" 
              popup={true}
              style={{ height: 500, margin: "50px" }} 
              components={{event: this.Event}}
            />

            <br/>
            <Panel header="Events List">
            
            <Menubar model={this.eventPostOptions}/>

            </Panel>
          </TabPanel>


          <TabPanel header="Metrics" leftIcon="pi pi-chart-line">
            <Menubar model={this.metricPreOptions}/>
            <br />
            <ChartContainer timeRange={series.range()} format="%b '%y">
              <ChartRow height="150">
                  <YAxis
                      id="metricGraph"
                      label="Values"
                      min={series.min()} max={series.max()}
                      width="60" format=",.2f"/>
                  <Charts>
                      <LineChart axis="metricGraph" series={series} style={style}/>                                            
                      <Baseline axis="metricGraph" style={baselineStyleLite} value={series.avg() - series.stdev()}/>
                      <Baseline axis="metricGraph" style={baselineStyleLite} value={series.avg() + series.stdev()}/>
                  </Charts>
              </ChartRow>
            </ChartContainer>
            <br />
            <Panel header="Contact List">
            <DataTable value={this.state.metrics} paginator={true} rows={5} selectionMode="radiobutton" selection={this.state.selectedMetric} onSelectionChange={e => this.setState({selectedMetric: e.value})}>
              <Column selectionMode="single" headerStyle={{width: '3em'}}></Column>
              <Column field="id" header="ID"></Column>
              <Column field="name" header="Name"></Column>
              <Column field="metricValue" header="Metric Value"></Column>
              <Column field="metricTime" header="Time"></Column>
            </DataTable>
            </Panel>

          </TabPanel>


        </TabView>  
        




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





        <Dialog id="eventDialog" header="Event" visible={this.state.eventVisible} style={{width: '80%'}} footer={this.footerEvent} modal={true} onHide={() => this.setState({eventVisible: false})}>
            <form id="event-form">
              <span className="p-float-label">
                <InputText value={this.state.event.title} style={{width : '100%'}} id="title" onChange={(e) => {
                    let val = e.target.value;
                    this.setState(prevState => {
                        let event = Object.assign({}, prevState.event);
                        event.title = val;
                        return { event };
                    })}
                  } />
                <label htmlFor="title">Title</label>
              </span>
              <br/>
              <span className="p-float-label">
                <InputText value={this.state.event.description} style={{width : '100%'}} id="description" onChange={(e) => {
                    let val = e.target.value;
                    this.setState(prevState => {
                        let event = Object.assign({}, prevState.event);
                        event.description = val;
                        return { event };
                    })}
                  } />
                <label htmlFor="description">Description</label>
              </span>
              <br/>
              <span className="p-float-label">
                  <Calendar id="startDate" 
                    value={this.state.event.startDate} 
                    onChange={
                      (e) => {
                        let val = e.target.value;
                        this.setState(prevState => {
                          let event = Object.assign({}, prevState.event);
                          event.startDate = val;
                          return { event };
                        })
                      }
                    } 
                    showTime showSeconds />
                <label htmlFor="startDate">Start Date</label>
              </span>
              <br/>
              <span className="p-float-label">
                  <Calendar id="endDate"
                    value={this.state.event.endDate} 
                    onChange={
                      (e) => {
                        let val = e.target.value;
                        this.setState(prevState => {
                          let event = Object.assign({}, prevState.event);
                          event.endDate = val;
                          return { event };
                        })
                      }
                    } 
                    showTime showSeconds />
                <label htmlFor="endDate">End Date</label>
              </span>
            </form>
        </Dialog>

        <Dialog id="metricDialog" header="Metric" visible={this.state.metricVisible} style={{width: '400px'}} footer={this.footerMetric} modal={true} onHide={() => this.setState({metricVisible: false})}>
            <form id="metric-form">
              <span className="p-float-label">
                <InputText value={this.state.metric.name} style={{width : '100%'}} id="name" onChange={(e) => {
                    let val = e.target.value;
                    this.setState(prevState => {
                        let metric = Object.assign({}, prevState.metric);
                        metric.name = val;
                        return { metric };
                    })}
                  } />
                <label htmlFor="name">Name</label>
              </span>
              <br/>
              <span className="p-float-label">
                <InputText value={this.state.metric.metricValue} style={{width : '100%'}} id="metricValue" onChange={(e) => {
                    let val = e.target.value;
                    this.setState(prevState => {
                        let metric = Object.assign({}, prevState.metric);
                        metric.metricValue = val;
                        return { metric };
                    })}
                  } />
                <label htmlFor="metricValue">Metric Value</label>
              </span>
              <br/>
              <span className="p-float-label">
                <Calendar id="metricTime" 
                    value={this.state.metric.metricTime} 
                    onChange={
                      (e) => {
                        let val = e.target.value;
                        this.setState(prevState => {
                          let metric = Object.assign({}, prevState.metric);
                          metric.metricTime = val;
                          return { metric };
                        })
                      }
                    } 
                    showTime showSeconds />
                <label htmlFor="metricTime">Timestamp</label>

              </span>
            </form>
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

  /* Save Methods */
  showSaveEventDialog(){
    this.setState({
      eventVisible : true,
      event : {
        id: null,
        title: "",
        description: "",
        startDate: "",
        endDate: ""
      }
    });
    document.getElementById('event-form').reset();
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

  showSaveMetricDialog() {
    this.setState({
      metricVisible : true,
      metric : {
        id: null,
        name: "",
        metricValue: "",
        metricTime: ""
      }
    });
    document.getElementById('metric-form').reset();
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

  showEditEventDialog() {
    this.setState({
      eventVisible : true,
      event : {
        id: this.state.selectedEvent.id,
        title: this.state.selectedEvent.title,
        description: this.state.selectedEvent.description,
        startDate: this.state.selectedEvent.startDate,
        endDate: this.state.selectedEvent.endDate
      }
    })
  }

}

/*







            */