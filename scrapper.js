const cheerio = require("cheerio");
const request = require("request-promise");
var fs = require("fs");

const techTecnology = [
  "notebooks",
  "computadoras",
  "tabletas",
  "smartbands-smartwatchs",
  "monitores",
  "componentes",
  "informaticaaccesorios",
  "conectividad",
];

var products = [];
var productsToJson=[];


var name_pos = 1;
var priceNormal_pos = 1;
var priceSpecial_pos = 1;
var img_pos = 1;
var descriptionLink_pos = 1;

async function init(url, category) {
  const $ = await request({
    uri: url,
    transform: (body) => cheerio.load(body),
  });

  const name = $("h2.product-name a").each((i, el) => {
    products[name_pos] = {};
    products[name_pos].name = $(el).text();
    name_pos++;
  });

  const priceNormal = $("span.old-price span.price").each((i, el) => {
    products[priceNormal_pos].priceNormal = $(el).text();
    priceNormal_pos++;
  });

  const priceSpecial = $("span.special-price span.price").each((i, el) => {
    products[priceSpecial_pos].priceSpecial = $(el).text();
    priceSpecial_pos++;
  });

  const img = $("span.product-image-wrapper img.product-image-photo").each(
    (i, el) => {
      products[img_pos].img = $(el).attr("data-src");
      products[img_pos].description = "";
      products[img_pos].weight = "";
      products[img_pos].brand = "";
      products[img_pos].category = category;
      img_pos++;
    }
  );

  const descriptionLink = $("a.product").each((i, el) => {
    products[descriptionLink_pos].descriptionLink = $(el).attr("href");
    descriptionLink_pos++;
  });
}

async function scrapper() {
  for (let i = 0; i < techTecnology.length; i++) {
    let category = techTecnology[i]
    await init(
      `https://delta.com.ar/tecnologia/${techTecnology[i]}.html?product_list_limit=36`, category
    );
  }
}

async function initDetail(product) {
  const {descriptionLink} = product;
  
  const $ = await request({
    uri: descriptionLink,
    transform: (body) => cheerio.load(body),
  });

  let description = $("div.data table td[data-th=Descripcion]").html();
  product.description = description;

  let weight = $("div.data table td[data-th=Weight]").html();
  product.weight = weight;

  let brand = $("div.data table td[data-th=Marca]").html();
  product.brand= brand 

  productsToJson.push(product)

  fs.writeFile("input.json", JSON.stringify(productsToJson), function (err) {
    if (err) throw err;
    console.log(productsToJson);
  });
  // console.log(productsToJson.length)
}  

async function toFile(products) {
  products.forEach(async(product)=>{
    await initDetail(product)
  })
}


async function projectDB(){
  await scrapper();
  await toFile(products)
}

projectDB()




// init("https://delta.com.ar/mouse_wireless_lenovo_530_abyss_blue-52896.html");

//   //Este utiliza el link del producto!
//   const description = $("div.data table td[data-th=Descripcion]").html();
//   console.log(description);

//   const weight = $("div.data table td[data-th=Weight]").html();
//   console.log(weight);

//   const brand = $("div.data table td[data-th=Marca]").html();
//   console.log(brand);
