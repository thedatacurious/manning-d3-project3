// const margin = {top: 100, right: 20, bottom: 50, left: 50};
// const width = 1160;
// const height = 600;
const groups = [
  { key: 'nominees_caucasian', label: 'caucasian or another', color: '#9BC4CB' },
  { key: 'nominees_afrodescendant', label: 'afrodescendant', color: '#BDA0BC' },
  { key: 'nominees_hispanic', label: 'hispanic', color: '#A2708A' },
  { key: 'nominees_asian', label: 'asian', color: '#0B4F6C' },
];

  let dataFormatted = [];

  // Create your visualization here
async function createViz(){

// Load the data here


  const dataset = await d3.csv('./data/academy_awards_nominees.csv')
  const totalNominees = d3.rollup(dataset, v => v.length, d => d.year, d => d.ethnic_background).entries();

  for (let i of totalNominees){
    const year = new Date(parseInt(i[0]),0);
    const nominees_caucasian = i[1].get('') || 0;
    const nominees_afrodescendant = i[1].get('black') || 0;
    const nominees_hispanic = i[1].get('hispanic') || 0;
    const nominees_asian = i[1].get('asian') || 0;
    const nominees_total = nominees_caucasian + nominees_afrodescendant + nominees_hispanic + nominees_asian;

    let entryFormatted = new Nominees(year,nominees_total, nominees_caucasian, nominees_afrodescendant,nominees_hispanic,nominees_asian)
    dataFormatted.push(entryFormatted)

    // console.log(year,nominees_total, nominees_caucasian, nominees_afrodescendant,nominees_hispanic,nominees_asian)
  }




function Nominees(year,nominees_total,nominees_caucasian, nominees_afrodescendant,nominees_hispanic,nominees_asian){
  this.year = year;
  this.nominees_total = nominees_total;
  this.nominees_caucasian = nominees_caucasian;
  this.nominees_afrodescendant = nominees_afrodescendant;
  this.nominees_hispanic = nominees_hispanic;
  this.nominees_asian = nominees_asian;
}

  // Set chart dimensions
  let dimensions = {
    width: 1160,
    height: 600,
    margin: {
      top: 100,
      right: 100,
      bottom: 50,
      left: 25,
    },
  }

  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  const wrapper = d3.select('#viz')
  .append('svg')
  .attr('width', dimensions.width)
  .attr('height', dimensions.height)

  const bounds = wrapper.append('g')
  .style('transform', `translate(${dimensions.margin.left}px,  ${dimensions.margin.top}px)`)

  // Create scale

  const colorScale = d3.scaleOrdinal().domain(groups.map(d=> d.key)).range(groups.map(d => d.color))

  const xScale = d3.scaleTime().domain(d3.extent(dataFormatted.map(d=> d.year))).range([0,dimensions.boundedWidth])

  const yScale = d3.scaleLinear().domain([0, d3.max(dataFormatted.map(d => d.nominees_total))]).range([dimensions.boundedHeight,0])

  const stack = d3.stack()
  .keys(groups.map(d=> d.key))
  .order(d3.stackOrderAscending)
  .offset(d3.stackOffsetNone)

  let series = stack(dataFormatted);


  // Area generator

  const stackArea = d3.area() // Each array in series rep an ethnicity will be fed to areaGenerator
  .x(d => xScale(d.data.year))
  .y0(d => yScale(d[0]))
  .y1(d => yScale(d[1]))
  .curve(d3.curveCatmullRom)

  // Draw dataset


  const nomineesPath = bounds.append('g')
  .attr('class', 'stream-paths')
  .selectAll('path')
  .data(series)
  .join('path')
  .attr('d', d => stackArea(d))
  .style('fill', d => colorScale(d.key));

  // Generate axes

  const yAxisGenerator = d3.axisLeft().scale(yScale)
  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)


  const yAxis = bounds.append('g').call(yAxisGenerator).attr('class','axis')

  const xAxis = bounds.append('g')
  .call(xAxisGenerator)
  .style('transform', `translateY(${dimensions.boundedHeight}px)`)
  .attr('class', 'axis')

  xAxis
  .append('text')
  .text('Year')
  .attr('class', 'axis')
  .style('transform', `translate(${dimensions.boundedWidth}px,${dimensions.margin.bottom}px)`)

  yAxis
  .append('text')
  .text('Number of Nominees')
  .attr('class', 'axis')
  .style('text-anchor', 'start')
  .style('transform', `translate(${-dimensions.margin.left}px,${-dimensions.margin.top/4}px)`)

  // Add color Legend

  const legend = d3.select('div.legend')
  .style('transform', `translateY(${-dimensions.margin.bottom/3}px)`)

  const entries = legend.append('ul')
  .selectAll('li')
  .data(groups)
  .join('li')
  .attr('class', 'legend')

  entries.append('span')
  .attr('class', 'legend-color')
  .style('background-color', d => d.color)

  entries.append('span')
  .text(d => d.key.replace('nominees_',''))
  .attr('class', 'legend')


};

createViz();
