const { MSICreator } = require('electron-wix-msi')
const path = require('path')
;(async () => {
  // Step 1: Instantiate the MSICreator
  const msiCreator = new MSICreator({
    appDirectory: path.resolve('./win-build/win-unpacked'),
    description: 'User Driver',
    exe: 'userDriver',
    name: 'userDriver',
    shortName: 'userDriver',
    shortcutFolderName: 'userDriver',
    shortcutName: 'userDriver',
    programFilesFolderName: 'userDriver',
    manufacturer: 'Mina Rezkallah',
    version: '1.0.0',
    appIconPath: path.resolve('./assets/img/login.ico'),
    outputDirectory: path.resolve('./app-exe'),
    appUserModelId: 'com.ISEC.app',
    ui: {
      chooseDirectory: true,
      // images: {
      //     background: path.resolve('./assets/img/setting.jpg'),
      //     banner: path.resolve('./assets/img/setting.jpg'),
      //     exclamationIcon: path.resolve('./assets/img/setting.ico'),
      //     infoIcon: path.resolve('./assets/img/setting.ico'),
      //     newIcon: path.resolve('./assets/img/setting.ico'),
      //     upIcon: path.resolve('./assets/img/setting.ico')
      // },
    },
    features: {
      autoLaunch: true,
    },
    // defaultInstallMode: 'perUser',
    extensions: ['WixUIExtension', 'WixUtilExtension', 'WixNetFxExtension'],
    // extensions: [
    //   'WixUtilExtension',
    //   'C:Program Files (x86)WiX Toolset v3.11\binWixUtilExtension.dll',
    // ],
  })

  // Step 2: Create a .wxs template file
  await msiCreator.create()

  // Step 3: Compile the template to a .msi file
  await msiCreator.compile()
})()
  .then(() => console.log('sucsses build'))
  .catch((error) => console.log(error))
