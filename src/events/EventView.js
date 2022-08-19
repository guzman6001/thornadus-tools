import React, {Component} from 'react';
import {EventService}     from './EventService';
import {DataTable}        from 'primereact/datatable';
import {Column}           from 'primereact/column';
import {Panel}            from 'primereact/panel';
import {Menubar}          from 'primereact/menubar';
import {Calendar as PrimeCalendar}         from 'primereact/calendar';
import {Dialog}           from 'primereact/dialog';
import {InputText}        from 'primereact/inputtext';
import {Button}           from 'primereact/button';
import {Growl}            from 'primereact/growl';

import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek"

import { Calendar as PanelCalendar, dateFnsLocalizer } from 'react-big-calendar'

import "../App.css";
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import "react-datepicker/dist/react-datepicker.css";
import 'primereact/resources/themes/nova-light/theme.css';
import "react-big-calendar/lib/css/react-big-calendar.css";



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

export class EventView extends Component{
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
      eventVisible: false,
      calendarEvents: null,

      contactHistoryList: null,

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
      }

    };
    

    // Menu Options:
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

    this.eventService   = new EventService();
    this.saveEvent  = this.saveEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);


    this.footerEvent = (
      <div>
        <Button label="Guardar" icon="pi pi-check" onClick={this.saveEvent} />
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
  
    return (
      <div>
        
        
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
            <DataTable value={this.state.events} paginator={true} rows={5} selectionMode="radiobutton" selection={this.state.selectedEvent} onSelectionChange={e => this.setState({selectedEvent: e.value})}>
              <Column selectionMode="single" headerStyle={{width: '3em'}}></Column>
              <Column field="id" header="ID"></Column>
              <Column field="title" header="Title"></Column>
              <Column field="description" header="Description"></Column>
              <Column field="startDate" header="Start Date"></Column>
              <Column field="endDate" header="End Date"></Column>
            </DataTable>
            <Menubar model={this.eventPostOptions}/>

            </Panel>

        <Dialog id="eventDialog" 
          header="Event" 
          visible={this.state.eventVisible} 
          style={{width: '80%'}} 
          footer={this.footerEvent} 
          modal={true} 
          onHide={() => this.setState({eventVisible: false})}>
            <form id="event-form">
              <span className="p-float-label">
                <InputText value={this.state.event.title} 
                  style={{width : '100%'}} 
                  id="title" 
                  onChange={(e) => {
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
                  <PrimeCalendar id="startDate" 
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
                  <PrimeCalendar id="endDate"
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

        <Growl ref={(el) => this.growl = el} />
      </div>
    );
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

  /* Edit Methods */
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
