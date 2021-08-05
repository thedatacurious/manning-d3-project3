const margin = {top: 100, right: 20, bottom: 50, left: 50};
const width = 1160;
const height = 600;
const groups = [
  { key: 'nominees_caucasian', label: 'caucasian or another', color: '#EFC7C2' },
  { key: 'nominees_afrodescendant', label: 'afrodescendant', color: '#68A691' },
  { key: 'nominees_hispanic', label: 'hispanic', color: '#694F5D' },
  { key: 'nominees_asian', label: 'asian', color: '#BFD3C1' },
];

  let dataFormatted = [];

// Load the data here



const dataset = d3.csv('./data/academy_awards_nominees.csv').then(d=> {


  const totalNominees = d3.rollup(d, v => v.length, d => d.year, d => d.ethnic_background).entries();

  for (let i of totalNominees){
    const year = new Date(parseInt(i[0]),0).getFullYear();
    const nominees_caucasian = i[1].get('') || 0;
    const nominees_afrodescendant = i[1].get('black') || 0;
    const nominees_hispanic = i[1].get('hispanic') || 0;
    const nominees_asian = i[1].get('asian') || 0;
    const nominees_total = nominees_caucasian + nominees_afrodescendant + nominees_hispanic + nominees_asian;

    let entryFormatted = new Nominees(year,nominees_total, nominees_caucasian, nominees_afrodescendant,nominees_hispanic,nominees_asian)
    dataFormatted.push(entryFormatted)

    // console.log(year,nominees_total, nominees_caucasian, nominees_afrodescendant,nominees_hispanic,nominees_asian)
  }


})

function Nominees(year,nominees_total,nominees_caucasian, nominees_afrodescendant,nominees_hispanic,nominees_asian){
  this.year = year;
  this.nominees_total = nominees_total;
  this.nominees_caucasian = nominees_caucasian;
  this.nominees_afrodescendant = nominees_afrodescendant;
  this.nominees_hispanic = nominees_hispanic;
  this.nominees_asian = nominees_asian;
}



// Create your visualization here
const createViz = (dataFormatted) => {
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

  const timeScale = d3.scaleTime().domain(d3.extent(dataFormatted.map(d=> d.year))).range([0,dimensions.boundedWidth])

  const areaStack = d3.stack()
  .keys([groups])
  .order(d3.stackOrderAscending)
  .offset(d3.stackOffsetNone)


};
