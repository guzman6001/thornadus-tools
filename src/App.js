import React, {Component} from 'react';
import {EventView}        from './events/EventView';
import {MetricView}       from './metrics/MetricView';
import {ContactView}      from './contacts/ContactView';

import {TabView, TabPanel} from 'primereact/tabview';

import "./App.css";
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/nova-colored/theme.css';


export default class App extends Component{

  render(){

    return (
      <div style={{width:'80%', margin: '0 auto', marginTop: '20px'}}>
        <h2>Thornadus Tools</h2>
        <TabView className="tabview-header-icon">

          <TabPanel header="Contacts" leftIcon="pi pi-users">
            <ContactView />            
          </TabPanel>

          <TabPanel header="Events" leftIcon="pi pi-calendar">
            <EventView /> 
          </TabPanel>

          <TabPanel header="Metrics" leftIcon="pi pi-chart-line">
            <MetricView /> 
          </TabPanel>
        </TabView>  
        
      </div>
    );
  }

}
