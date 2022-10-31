import React, {Component} from 'react';
import {MetricService}    from './MetricService';
import {DataTable}        from 'primereact/datatable';
import {Column}           from 'primereact/column';
import {Panel}            from 'primereact/panel';
import {Menubar}          from 'primereact/menubar';
import {Calendar as PrimeCalendar}         from 'primereact/calendar';
import {Dialog}           from 'primereact/dialog';
import {InputText}        from 'primereact/inputtext';
import {Button}           from 'primereact/button';
import {Growl}            from 'primereact/growl';

import {
  Charts,
  ChartContainer,
  ChartRow,
  YAxis,
  Baseline,
  LineChart,
  Resizable
} from "react-timeseries-charts";
import { TimeSeries } from "pondjs";

import "react-datepicker/dist/react-datepicker.css";

 const series = new TimeSeries({
  name: "Metrics Timeline",
  columns: ["time", "value"],
  points: [
    [1656519757000,45],
    [1656520757000,12],
    [1656521757000,45],
    [1656522757000,0],
    [1656523757000,45],
    [1656524757000,23],
    [1656525757000,34]
  ]
});
/** [[1656519757000,45],[1656520757000,12],[1656521757000,45],
  [1656522757000,0],[1656523757000,45],[1656524757000,23],[1656525757000,34]] */
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


export class MetricView extends Component{
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

      metric: {
        id: null,
        name: "",
        metricValue: "",
        metricTime: ""
      },
      selectedMetric : {

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
    this.metricPostOptions = [
      {
        label : 'Edit Selected Metric',
        icon  : 'pi pi-fw pi-pencil',
        command : () => {this.showEditMetricDialog()}
      },
      {
        label : 'Refresh',
        icon  : 'pi pi-fw pi-refresh',
        command : () => {this.refreshMetrics()}
      },
      {
        label : 'Delete Selected Metric',
        icon  : 'pi pi-fw pi-trash',
        command : () => {this.deleteMetric()}
      }
    ];
  

    this.metricService  = new MetricService();
    this.saveMetric = this.saveMetric.bind(this);
    this.deleteMetric = this.deleteMetric.bind(this);



    this.footerMetric = (
      <div>
        <Button label="Guardar" icon="pi pi-check" onClick={this.saveMetric} />
      </div>
    );
  }

  componentDidMount(){
    this.metricService.getAll().then(data => this.setState({metrics: data}));
    this.metricService.getPoints().then(data => this.setState({pointsValue: data}));
    series.points=this.state.pointsValue;
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

  deleteMetric() {
    if(window.confirm("Are you sure?")) {
      this.metricService.delete(this.state.selectedMetric.id).then(data => {
        this.growl.show({severity: 'success', summary: 'Success', detail: 'Metric was deleted'});
        this.metricService.getAll().then(data => this.setState({metrics: data}));
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
    series.points=this.state.pointsValue;

    return (
      <div>
        <Menubar model={this.metricPreOptions}/>
            <br />
            <Resizable>
            <ChartContainer timeRange={series.range()} format="%b '%y" timeAxisTickCount={5}>
              <ChartRow height="150">
                  <YAxis
                      id="metricGraph"
                      label="Values"
                      min={series.min()} max={series.max()}
                      width="60" format=",.2f"/>
                  <Charts>
                      <LineChart axis="metricGraph" series={series} style={style}/>                                            
                      
                      <Baseline axis="metricGraph" style={baselineStyleLite} label="Min" position="right" value={series.min()}/>
                      <Baseline axis="metricGraph" style={baselineStyleLite} label="Avg" position="right" value={series.avg()}/>
                      <Baseline axis="metricGraph" style={baselineStyleLite} label="Max" position="right" value={series.max()}/>
                  </Charts>
              </ChartRow>
            </ChartContainer>
            </Resizable>
            <br />
            <Panel header="Metrics List">
            <DataTable value={this.state.metrics} paginator={true} rows={5} selectionMode="radiobutton" 
              selection={this.state.selectedMetric} onSelectionChange={e => this.setState({selectedMetric: e.value})}>
              <Column selectionMode="single" headerStyle={{width: '3em'}}></Column>
              <Column field="id" header="ID"></Column>
              <Column field="name" header="Name"></Column>
              <Column field="metricValue" header="Metric Value"></Column>
              <Column field="metricTime" header="Time"></Column>
            </DataTable>
            <Menubar model={this.metricPostOptions}/>
            </Panel>

        



       


        <Dialog id="metricDialog" header="Metric" visible={this.state.metricVisible} style={{width: '400px'}} 
        footer={this.footerMetric} modal={true} onHide={() => this.setState({metricVisible: false})}>
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
                <PrimeCalendar id="metricTime" 
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

 /* Save Methods */
 showSaveMetricDialog(){
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
  showEditMetricDialog() {
    this.setState({
      metricVisible : true,
      metric : {
        id: this.state.selectedMetric.id,
        name: this.state.selectedMetric.name,
        metricValue: this.state.selectedMetric.metricValue,
        metricTime: this.state.selectedMetric.metricTime
      }
    })
  }

  refreshMetrics() {
    alert("Series: "+series);

    alert("A: "+series["points"]);
    alert("B: "+series.points);
    alert("C: "+this.state.pointsValue);
    series.points=this.state.pointsValue;

  }

}
