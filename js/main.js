const margin = {top: 100, right: 20, bottom: 50, left: 50};
const width = 1160;
const height = 600;
const groups = [
  { key: 'nominees_caucasian', label: 'caucasian or another', color: '#EFC7C2' },
  { key: 'nominees_afrodescendant', label: 'afrodescendant', color: '#68A691' },
  { key: 'nominees_hispanic', label: 'hispanic', color: '#694F5D' },
  { key: 'nominees_asian', label: 'asian', color: '#BFD3C1' },
];

// Load the data here

const dataset = d3.csv('./data/academy_awards_nominees.csv').then(d=> {
  const ethnicBreakdown = d3.rollups(d, v => d3.count(v, d=> d.ethnic_background), d=> d.year)
  // const totalNominees = d3.rollup(d, v => d3.sum(v.length, d => d.ethnic_background), d => d.year)
  console.log(groups.map(d => d.color))
})

// Create your visualization here
const createViz = () => {
  // Set chart dimensions
  let dimensions = {
    width: 1160,
    height: 600,
    margin: {
      top: 100,
      right: 20,
      bottom: 50,
      left: 50,
    },
  }

  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  const wrapper = d3.select('#viz')
  .append('svg')
  .attr('width', dimensions.boundedWidth)
  .attr('height', dimensions.boundedHeight)

  // Create scale

  const colorScale = d3.scaleOrdinal().domain(groups.map(d=> d.key)).range(groups.map(d => d.color))

  const timeScale = d3.scaleTime().domain(d3.extent(dataFormated.year, d => new Date(parseInt(d.year), 0))).range([0,dimensions.boundedWidth])

  const areaStack = d3.stack()
  .keys([groups])
  .order(d3.stackOrderAscending)
  .offset(d3.stackOffsetNone)


};
