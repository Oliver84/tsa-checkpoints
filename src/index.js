import React, { Component } from 'react';
import { render } from 'react-dom';
import { Chart, Line, Bar } from 'react-chartjs-2';
import database from './firebase';
import { propOr, last } from 'ramda';
import 'chartjs-plugin-zoom';
import 'chartjs-plugin-datalabels';
import './style.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkpoints: [],
      loading: true,
      isMobile: false,
    };
  }

  componentDidMount() {
    let checkpoints = [];
    database
      .collection('checkpoints')
      .orderBy('date')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => checkpoints.push(doc.data()));
        this.setState({ checkpoints, loading: false });
      })
      .catch((err) => console.error(err));
    if (window.screen.width < 800) {
      this.setState({ isMobile: true });
    }
  }
  formatNum = (num) => parseInt(num.replace(',', '').replace(',', ''));

  render() {
    const { checkpoints, loading, isMobile } = this.state;

    const data = {
      labels: checkpoints.map((entry) =>
        entry.date.toDate().toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Travelers in 2019',
          data: checkpoints.map((entry) => this.formatNum(entry['2020'])),
          backgroundColor: 'rgba(0, 102, 153, 0.2)',
          borderColor: 'rgba(0, 102, 153, 1)',
          borderWidth: 1,
          fill: 1,
          yAxisID: 'y-axis-1',
          barThickness: 'flex',
          datalabels: {
            display: false,
          },
        },
        {
          label: 'Travelers in 2020',
          data: checkpoints.map((entry) => this.formatNum(entry['2019'])),
          backgroundColor: 'rgba(0, 102, 153, 0.6)',
          borderColor: 'rgba(0, 102, 153, 1)',
          borderWidth: 1,
          fill: 1,
          yAxisID: 'y-axis-1',
          barThickness: 'flex',
          datalabels: {
            formatter: (value, context) => {
              // console.log('value: ', value)
              // console.log('context: ', context)
              // console.log('context: ', context.chart.data.datasets[context.datasetIndex])
              const data2019 =
                context.chart.data.datasets[context.datasetIndex].data[
                  context.dataIndex
                ];
              const data2020 =
                context.chart.data.datasets[0].data[context.dataIndex];
              const percentValue = Math.round((data2019 / data2020) * 100);
              return context.datasetIndex === 0 ? null : `${percentValue} %`;
            },
            anchor: 'top',
            display: 'auto',
            font: {
              size: isMobile ? 32 : 12,
              style: 'bold',
            },
            color: 'white',
            display: isMobile ? true : false,
          },
        },
      ],
    };

    const options = {
      maintainAspectRatio: false,
      legend: {
        labels: {
          fontSize: isMobile ? 32 : 12,
        },
        position: 'bottom',
      },
      layout: {
        padding: {
          top: 10,
          bottom: isMobile ? 30 : 5,
        },
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItems, data) {
            const amount = data.datasets[tooltipItems.datasetIndex].data[
              tooltipItems.index
            ].toLocaleString();
            return amount < 100 ? Math.round(amount) + ' %' : amount;
          },
          footer: (tooltipItems, data) => {
            const data2019 =
              data.datasets[tooltipItems[0].datasetIndex].data[
                tooltipItems[0].index
              ];
            const data2020 = data.datasets[0].data[tooltipItems[0].index];
            const percentValue = Math.round((data2019 / data2020) * 100);
            return tooltipItems[0].datasetIndex === 0
              ? null
              : `${percentValue} %`;
          },
        },
        titleFontSize: isMobile ? 28 : 12,
        bodyFontSize: isMobile ? 28 : 12,
        footerFontSize: isMobile ? 28 : 12,
      },
      scales: {
        xAxes: [
          {
            stacked: true,
            type: 'time',
            distribution: 'linear',
            ticks: {
              source: 'data',
              min: new Date(
                propOr(
                  '',
                  'seconds',
                  propOr(
                    '',
                    'date',
                    checkpoints[checkpoints.length - (isMobile ? 5 : 30)]
                  )
                ) * 1000
              ),
              max: propOr('', 'date', last(checkpoints)),
              fontSize: isMobile ? 36 : 12,
              padding: isMobile ? 50 : 5,
            },
            offset: true,
          },
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: false,
              fontSize: isMobile ? 30 : 12,
              callback: function (value, index, values) {
                return (value / 1000000).toLocaleString() + 'M';
              },
            },
            stacked: false,
            type: 'linear',
            display: true,
            position: 'left',
            id: 'y-axis-1',
          },
        ],
      },
      pan: {
        enabled: true,
        mode: 'x',
        speed: 20,
        threshold: 10,
      },
      zoom: {
        enabled: true,
        drag: false,
        mode: 'x',
        speed: 0.1,
        threshold: 2,
        sensitivity: 3,
      },
    };

    const getCheckpoints = (year, index) =>
      this.formatNum(
        propOr('0', year, checkpoints[checkpoints.length - index])
      );

    const yoyChange =
      100 - (getCheckpoints(2019, 1) / getCheckpoints(2020, 1)) * 100;
    const dailyChange = Math.ceil(
      100 -
        yoyChange -
        (getCheckpoints(2019, 2) / getCheckpoints(2020, 2)) * 100
    );
    return (
      <div className="container">
        <div
          className="chart"
          style={{
            height: isMobile ? '70vh' : '55vh',
            paddingBottom: isMobile ? '250px' : '150px',
          }}
        >
          <div className="title">
            <p className="title-tsa">TSA</p>
            <p className="title-subtitle">Traveler Throughput</p>
          </div>
          <span className="change-text">
            Daily: {!loading && Math.round(dailyChange)}%
          </span>
          <span className={dailyChange > 0 ? "arrow-up" : "arrow-down"}></span>
          <span className="change-text">
            Year over year: {!loading && Math.round(yoyChange)}%{' '}
          </span>
          <span className="arrow-down"></span>
          <Bar id="chart" data={data} options={options} />
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
