const sharp = require('sharp')
const fs = require('fs').promises

const wait_time_seconds = 5

const do_the_pre_extend = async (files, new_folder_name) => {
  const stuffs = await files.map(async (file, i) => {
    await sharp(`./images/${file}`)
      .metadata()
      .then(async ({width, height}) => {
        if (height > width) {
          sharp(`./images/${file}`)
            .extend({left: (height - width) / 2, right: (height - width) / 2, background: '#fff'})
            .toFile(`./${new_folder_name}/temp/${Date.now() + i}.png`, (a, b) => console.log('extended', a, b))
        } else {
          sharp(`./images/${file}`).toFile(`./${new_folder_name}/temp/${Date.now() + i}.png`, (a, b) =>
            console.log('no extension', a, b)
          )
        }
      })
  })

  const done = await Promise.all(stuffs)
  return done
}

const do_the_final_resize = async new_folder_name => {
  const files = await fs.readdir(`${new_folder_name}/temp`)
  console.log('resize files', files)
  const items = files.map(async (file, i) => {
    sharp(`./${new_folder_name}/temp/${file}`)
      .resize({height: 500, width: 500})
      .toFile(`./${new_folder_name}/${Date.now() + i}.png`, (a, b) => console.log('final resize', a, b))
  })

  return await Promise.all(items)
}

const resize = async () => {
  const files = await fs.readdir('images')

  const new_folder_name = Date.now()
  await fs.mkdir(`${new_folder_name}/temp`, {recursive: true})

  await do_the_pre_extend(files, new_folder_name)

  await setTimeout(async () => {
    await do_the_final_resize(new_folder_name)
  }, 1000 * wait_time_seconds)

  console.log('done')
}

resize()
