import React, { Component } from "react";
import { render } from "react-dom";
import { Line, Bar } from "react-chartjs-2";
import database from './firebase';
import{ propOr } from 'ramda';
import "./style.css";

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checkpoints: [],
      loading: true,
    };
  }

  componentDidMount() {
    let checkpoints = [];
    database.collection("checkpoints").orderBy('date').get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => checkpoints.push(doc.data()));
      this.setState({ checkpoints, loading: false });
    })
    .catch(err => console.error(err));
  }
  formatNum = num => parseInt(num.replace(',','').replace(',',''));

  render() {
    const { checkpoints, loading } = this.state;
    
    const data = {
      labels: checkpoints.map(entry => entry.date.toDate().toLocaleDateString()),
      datasets: [
        {
          label: "Travelers in 2019",
          data: checkpoints.map(entry => this.formatNum(entry['2020'])),
          backgroundColor: "rgba(0, 102, 153, 0.2)",
          borderColor: "rgba(0, 102, 153, 1)",
          borderWidth: 1,
          fill: 1,
          yAxisID: "y-axis-1",
        },
        {
          label: "Travelers in 2020",
          data: checkpoints.map(entry => this.formatNum(entry['2019'])),
          backgroundColor: "rgba(0, 102, 153, 0.6)",
          borderColor: "rgba(0, 102, 153, 1)",
          borderWidth: 1,
          fill: 1,
          yAxisID: "y-axis-1",
        }
      ]
    };

    const options = {
      tooltips: {
        callbacks: {
          label: function(tooltipItems, data) {
            const amount = data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index].toLocaleString();
            return amount < 100 ? Math.round(amount) + ' %' : amount;
          },
          footer: (tooltipItems, data) => {
            const data2019 = data.datasets[tooltipItems[0].datasetIndex].data[tooltipItems[0].index];
            const data2020 = data.datasets[0].data[tooltipItems[0].index];
            const percentValue = Math.round(data2019/data2020 * 100);
            return tooltipItems[0].datasetIndex === 0 ? null : `${percentValue} %`;
          }
        }
      },
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [
          {
            ticks: {
              beginAtZero: false,
              callback: function(value, index, values) {
                return value.toLocaleString();
              }
            },
            stacked: false,
            type: "linear",
            display: true,
            position: "left",
            id: "y-axis-1",
          },
        ]
      }
    };

    const getCheckpoints = (year, index) => this.formatNum(propOr('0', year, checkpoints[checkpoints.length - index]));
   
    const yoyChange = 100 - getCheckpoints(2019, 1)/ getCheckpoints(2020, 1) * 100
    const dailyChange = getCheckpoints(2019, 1)/ getCheckpoints(2020, 1)/getCheckpoints(2019, 58)/ getCheckpoints(2020, 58)
    return (
      <div class="container">
        <div class="title">
          <h1>TSA</h1>
          <h2>Traveler Throughput</h2>
        </div>
        {/* <span className="change-text">Daily change: {!loading && Math.round(dailyChange)}%</span><span className="arrow-down"></span> */}
        <span className="change-text">Year over year change: {!loading && Math.round(yoyChange)}% </span><span className="arrow-down"></span>
        <Bar id="chart" data={data} options={options} />
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
