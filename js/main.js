// const margin = {top: 100, right: 20, bottom: 50, left: 50};
// const width = 1160;
// const height = 600;
const groups = [
  { key: 'nominees_caucasian', label: 'caucasian or another', color: '#9BC4CB' },
  { key: 'nominees_black', label: 'black', color: '#BDA0BC' },
  { key: 'nominees_hispanic', label: 'hispanic', color: '#A2708A' },
  { key: 'nominees_asian', label: 'asian', color: '#0B4F6C' },
];

  // Create your visualization here
async function createViz(){

// Load the data here


  const dataset = await d3.csv('./data/academy_awards_nominees.csv')

  // Create array for dropdown options
  let awards = [{id: 'all', label: 'All'}]
  dataset.forEach( d => {
     let awardEntry = {}
      awardEntry['id'] = d.award_id
      awardEntry['label'] = d.award_label

      const found = awards.some(entry => entry.id === d.award_id)

      if (!found){awards.push(awardEntry)}

  })


  let dataOriginal = dataset

  // Format dataset to get total and breakdown of nominees
  let dataFormatted = getBreakdown(dataset);

  // helper functions for formatting dataset
  function getBreakdown(data){
  const totalNominees = d3.rollup(data, v => v.length, d => d.year, d => d.ethnic_background).entries();

  let arrayEntry = []

  for (let i of totalNominees){
    const year = new Date(parseInt(i[0]),0);
    const nominees_caucasian = i[1].get('') || 0;
    const nominees_black = i[1].get('black') || 0;
    const nominees_hispanic = i[1].get('hispanic') || 0;
    const nominees_asian = i[1].get('asian') || 0;
    const nominees_total = nominees_caucasian + nominees_black + nominees_hispanic + nominees_asian;

    let entryFormatted = new Nominees(year,nominees_total, nominees_caucasian, nominees_black,nominees_hispanic,nominees_asian)
    arrayEntry.push(entryFormatted)
    }
    return arrayEntry;
  }

  function Nominees(year,nominees_total,nominees_caucasian, nominees_black,nominees_hispanic,nominees_asian){
    this.year = year;
    this.nominees_total = nominees_total;
    this.nominees_caucasian = nominees_caucasian;
    this.nominees_black = nominees_black;
    this.nominees_hispanic = nominees_hispanic;
    this.nominees_asian = nominees_asian;
  }

  // Set chart dimensions
  let dimensions = {
    width: 1150,
    height: 600,
    margin: {
      top: 100,
      right: 150,
      bottom: 50,
      left: 30,
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

  const areaGenerator = d3.area() // Each array in series rep an ethnicity will be fed to areaGenerator
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
  .attr('d', d => areaGenerator(d))
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
  .style('transform', `translate(${dimensions.boundedWidth*1.05}px,${dimensions.margin.bottom*.35}px)`)

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

  // Create tooltip

  var tooltip = wrapper.append('g')
  .style('transform', `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  tooltip.append('line')
  .attr('x1',0)
  .attr('y1',0)
  .attr('x2',0)
  .attr('y2', `${dimensions.boundedHeight}`)
  .attr('stroke', '#DFFE72')
  .attr('stroke-width',2)
  .attr('stroke-dasharray', '5,5')

  var tooltipYear = tooltip.append('text')
  .style('text-anchor', 'middle')
  .attr('fill', '#45343D')
  .attr('x', 0)
  .attr('y', `${dimensions.boundedHeight*1.1}`)


  var tooltipNum = tooltip
  .append('text')
  .append('tspan')
  .style('text-anchor', 'start')
  .attr('fill', '#45343D')
  .attr('class', 'label')



  // Add tooltip interactions

  nomineesPath.on('mousemove', e => {

    tooltip.style('transform', `translate(${e.offsetX}px,${dimensions.margin.top}px)`)

    var getYear = xScale.invert(Math.round(e.offsetX)).getFullYear()-2 //to correct for inverted year starting from 1930, not 1928 for some reason
    tooltipYear.text(getYear)

    dataFiltered = dataFormatted.filter(d => d.year.getFullYear() == getYear)

    let x = 10;

    if(e.offsetX > dimensions.boundedWidth/2){
      x = -150;
    }

    tooltipNum
    .text(`${dataFiltered[0].nominees_total} Total Nominees`)
    .attr('x',x)
    .attr('dy', '1.2em')
    .append('tspan')
    .text(`${dataFiltered[0].nominees_caucasian} White or Another`)
    .attr('x',x)
    .attr('dy', '1.2em')
    .append('tspan')
    .text(`${dataFiltered[0].nominees_black} Black`)
    .attr('x',x)
    .attr('dy', '1.2em')
    .append('tspan')
    .text(`${dataFiltered[0].nominees_hispanic} Hispanic`)
    .attr('x',x)
    .attr('dy', '1.2em')
    .append('tspan')
    .text(`${dataFiltered[0].nominees_asian} Asian`)
    .attr('x',x)
    .attr('dy', '1.2em')

  })

  // Additional interactions

  //// Add dropdown options to select element
  const dropDown = d3.select('#selectAward')

  dropDown
  .selectAll('option')
  .data(awards)
  .join('option')
  .attr('value', d => d.id)
  .text(d => d.label)

  //// Add event listener to select element, NOT option elements
  dropDown.on('change', ()  => {
    // Read current selection
    const selectedAward = dropDown.property('value')
    // Run update function
    update(selectedAward)

  })


  //// helper function to update the chart
  function update(selection){
    // Filter data according to selection
    let dataFiltered = selection === 'all'
    ?  dataOriginal
    : dataOriginal.filter(d => d.award_id === selection);

    // Format data
    dataFormatted = getBreakdown(dataFiltered);

    // Stack data
    series = stack(dataFormatted);

    // Pass new data to the drawing method
    nomineesPath.data(series)
    .transition()
    .duration(600)
    .attr('d', d => areaGenerator(d))
  }







};

createViz();
