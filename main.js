//document.getElementById("birthrate")
//document.getElementById("deathrate")
//document.getElementById("net-migration-rate")

// split inital popluation by how it is currently split then apply death+birth+micatrion rates

const nextPage = () => {

  let initalPopluation = document.getElementById("inital-popluation").value
  let targetYear = document.getElementById("target-year").value;

  if (!initalPopluation) {
    return;
  } else {
    localStorage.setItem("targetYear", targetYear);
    window.location.href = "simulator.html";
  }
};

// Load SHIRTTTT GRRRRR (connect to html) 
d3.json("canadaprovtopo.json").then(topology => {
  const svg = d3.select("svg");
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  // LIKE Ariana Grande  ONCE SAID, positions (zoom and move)
  const projection = d3.geoMercator()
    .scale(900)
    .translate([2275, 2550]);

    // path it duh 💅🙄 (umm file shit, and path is a thing in d3 that connect lines ig? best example is this:
    //    ( )
    //    -|-
    //    / \
    // but like coded, using data points in canadaprovtopo.json (idk girl it was githubbed))
  const path = d3.geoPath().projection(projection);
  const provinces = topojson.feature(topology, topology.objects.canadaprov);

  //outlinee of mappp 
  svg.selectAll("path")
    .data(provinces.features)
    .enter()
    .append("path")
    .attr("d", path)
    // make it look 😉😫💅 (change colours and shirt if u want)
    .attr("fill", "#f4f4f4")
    .attr("stroke", "#333")
    .attr("stroke-width", 0.8); // stroke? 🤨 (width of outline of map)

  // Load pop data babesss (gets data for each line, and the then is like a promise or soemthing, so once data is loaded, then do this  )
  d3.csv("final_canadian_population_data.csv").then(
    // rawdata is a array of each row, like first city is toronto, so torotno is the first object in the array known as rawdata
    rawData => {
    rawData.forEach(d => {
      d.Latitude = Number(d.Latitude); // working with data takes numbers, so convert to numbers, idk why the data isnt automatically in numbers, but whatevs 
      d.Longitude = Number(d.Longitude);
      d.Population = Number(d.Population);
      d.BirthRate = Number(d.BirthRate);
      d.DeathRate = Number(d.DeathRate);
      d.MigrationRate = Number(d.MigrationRate);
    });

    //RAWRRR VARIABLE DECALUREDDD

    // claened up data of pervousis shit
    let data = rawData;

    // literally just years 
    let year = 0;
    const targetYear = Number(localStorage.getItem("targetYear")); // the ending year that the user will put, and when the sim will stop :)

    // decalringing fucntion generateOneDotPerCity
    const generateOneDotPerCity = () => {

      // data is an array of cities, and map is like going throught each row of data, whihc is each city, then we are using a fucntion in which we do something to the city 
      return data.map(city => {

        // position of each dot based on what i did to the map when scaling it and shit (coverts coordinates to pixels)
        const [x, y] = projection([city.Longitude, city.Latitude]);
        // return girlie
        return {
          // returns data that will be used to make the dots (the rates change the [popluation, they aren't used to actually make the dots])
          x,
          y,
          city: city.City,
          province: city.Province,
          population: city.Population
        };
      });
    };

    
    const drawGrowingDots = (cityCircles) => {
      // svg.selectAll("circle") takes all cirles already on svg cnavas
      const update = svg.selectAll("circle")
      // d3 function to connect each cirle to a data point, d.city + d.province is a key that connects cityCircles to the right data line
        .data(cityCircles, d => d.city + d.province); 

        // if  dot dont exist, make one 
      update.enter()
      // makes cirle and remember svg? thats our canvas, like da vinki, make circles on canvas
        .append("circle")
        // attr is mostly for styling, colour and shit, and postion of dot (most are self explantory)
        .attr("cx", d => d.x) 
        .attr("cy", d => d.y)
        .attr("fill", "#5e60ce")
        .attr("opacity", 0.6)

        // combine with all other dots
        .merge(update)

        // smooth transition, wanna make it look like it groing is 24 frames/sec, not like 4/sec use this video for referance : https://youtu.be/FcSL198C2OY?si=nWEcTiVgKsU_Wxhu
        // change duration for however u want to make the animation look like
        .transition()
        .duration(100)

        // math to determine radius size, feel free to expieriment with this, i wanted to use the ? thing, but that didnt work nicely. do as yall feel tho
        .attr("r", d => Math.max(2, Math.sqrt(d.population) / 500)); 

        // popluation dies out, so does dot, removes dot for any cities that has died out 
      update.exit().remove();
    };

// i think this one is self explantory, questions text me at @shaivi123 insta babes
    const updatePopulation = () => {
      if (year > targetYear) return; // just stops the sim when year is reached

      data.forEach(d => {
        const births = d.Population * d.BirthRate;
        const deaths = d.Population * d.DeathRate;
        const migration = d.Population * d.MigrationRate;
        d.Population += births - deaths + migration;
      });

      // takes data needed for generating dats: generateOneDotPerCity() and makes dots :  drawGrowingDots()
      drawGrowingDots(generateOneDotPerCity());

      document.getElementById("year-display").innerText = `Year: ${year}`; // just displays what year we are on 
      // doesnt have a purpose yet, might later?
      year++;
    };

    // used to make the first inital dots, not a typo is swear, literally a do while loop type shit
    drawGrowingDots(generateOneDotPerCity());

    //for my lovely abi babyyy, to get it to speed up or slow down, chnage the 50, make it a varible and put an if statement based on what button is pressed and set the bariable okay thanks lovely
    setInterval(updatePopulation, 50);
  });
});
