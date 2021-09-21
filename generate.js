const fs = require('fs')

const images = fs.readdirSync('./images')

const tags = images.map(src => `<img src="./images/${src}" alt="Uncirculated ${src}">`)

fs.writeFileSync('./images.html', tags.join(`\n`))
console.log(JSON.stringify(tags, null, 2))