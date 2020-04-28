import React, { Component } from "react";
import { render } from "react-dom";
import { Line, Bar } from "react-chartjs-2";
import { tsaData } from './data.js';
import "./style.css";

class App extends Component {
  render() {
    const formatNum = num => parseInt(num.replace(',','').replace(',',''));
    const data = {
      labels: tsaData.map(entry => entry[0]),
      datasets: [
        {
          label: "2019",
          data: tsaData.map(entry => formatNum(entry[2])),
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
          fill: 1,
          yAxisID: "y-axis-1",
        },
        {
          label: "2020",
          data: tsaData.map(entry => formatNum(entry[1])),
          backgroundColor: "rgba(255, 0, 0, 0.4)",
          borderColor: "rgba(255, 0, 0, 1)",
          borderWidth: 1,
          fill: 1,
          yAxisID: "y-axis-1",
        },
        {
          label: "2020 vs 2019",
          data: tsaData.map(entry => (formatNum(entry[1])/formatNum(entry[2]))*100),
          backgroundColor: "rgba(0, 0, 100, .5)",
          borderColor: "rgba(0, 0, 100, .5)",
          borderWidth: 1,
          fill: false,
          type: 'line',
          yAxisID: "y-axis-2",
        }
      ]
    };

    const options = {
      tooltips: {
        callbacks: {
          label: function(tooltipItems, data) {
            const amount = data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index].toLocaleString();
            return amount < 100 ? Math.round(amount) + ' %' : amount;
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
            position: "right",
            id: "y-axis-2",
          }
        ]
      }
    };

    return (
      <div>
        <h1>TSA Checkpoints</h1>
        <p>Total Traveler Throughput</p>
        <Bar id="chart" data={data} options={options} />
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
