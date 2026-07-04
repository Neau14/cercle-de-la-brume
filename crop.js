const { Jimp } = require('jimp');

async function makeCircular() {
  try {
    const imagePath = 'C:\\Users\\antoi\\.gemini\\antigravity-ide\\brain\\f1d53def-781d-4b9a-ba66-e63f4031235f\\cercle_brume_logo_ds_1783198464383.png';
    const outputPath = 'C:\\Users\\antoi\\Desktop\\cercle-de-la-brume\\public\\logo_transparent.png';
    
    console.log('Reading image...');
    const image = await Jimp.read(imagePath);
    
    console.log('Cropping to circle...');
    image.circle(); // Crops image to circle and makes the background transparent
    
    console.log('Writing image...');
    await image.writeAsync(outputPath);
    console.log('Done!');
  } catch (e) {
    console.error('Error:', e);
  }
}

makeCircular();
