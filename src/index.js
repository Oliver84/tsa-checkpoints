import React, { Component } from "react";
import { render } from "react-dom";
import { Line, Bar } from "react-chartjs-2";
import database from './firebase';
import "./style.css";

class App extends Component {
  constructor(props) {
    super(props)
    this.state = { checkpoints: [] };
  }

  componentDidMount() {
    let checkpoints = [];
    database.collection("checkpoints").orderBy('date').get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => checkpoints.push(doc.data()));
      this.setState({ checkpoints });
    })
    .catch(err => console.error(err));
  }
  render() {
    console.log(this.state)
    const { checkpoints } = this.state;
    const formatNum = num => parseInt(num.replace(',','').replace(',',''));
    const data = {
      labels: checkpoints.map(entry => entry.date.toDate().toLocaleDateString()),
      datasets: [
        {
          label: "2019",
          data: checkpoints.map(entry => formatNum(entry['2020'])),
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
          fill: 1,
          yAxisID: "y-axis-1",
        },
        {
          label: "2020",
          data: checkpoints.map(entry => formatNum(entry['2019'])),
          backgroundColor: "rgba(255, 0, 0, 0.4)",
          borderColor: "rgba(255, 0, 0, 1)",
          borderWidth: 1,
          fill: 1,
          yAxisID: "y-axis-1",
        },
        {
          label: "2020 vs 2019",
          data: checkpoints.map(entry => (formatNum(entry['2019'])/formatNum(entry['2020']))*100),
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

    

    // tsaData.forEach(entry => {
    //   database.collection("checkpoints").add({
    //     date: new Date(entry[0]),
    //     2019: entry[1],
    //     2020: entry[2]
    //   })
    //   .then(() => console.log('doc written'))
    //   .catch(err => console.error(err));
    // })

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
