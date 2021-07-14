import groovy.json.JsonSlurper
import org.gradle.util.VersionNumber

import java.nio.file.Paths
import java.util.regex.Pattern

class Unimodule {
  String name
  List platforms
  List targets
  List androidPackages
  String directory
  String version
  String androidGroup
  String androidSubdirectory

  boolean supportsPlatform(String platform) {
    return platforms instanceof List && platforms.contains(platform)
  }

  boolean supportsTarget(String target) {
    return targets.size() == 0 || targets.contains(target)
  }
}

def getProjectPackageJson(File projectRoot) {
  String resolveScript = """
  const findUp = require('find-up');
  console.log(findUp.sync('package.json'));
  """
  String[] nodeCommand = ["node", "-e", resolveScript]
  String packageJsonPath = spawnProcess(nodeCommand, projectRoot)
  def packageJsonFile = new File(packageJsonPath)
  def packageJson = new JsonSlurper().parseText(packageJsonFile.text)
  return packageJson;
}

Map getAndroidConfig(File projectRoot) {
  def packageJson = getProjectPackageJson(projectRoot)
  if (packageJson == null || packageJson["react-native-unimodules"] == null || packageJson["react-native-unimodules"].android == null) {
    return [:]
  }
  return packageJson["react-native-unimodules"].android
}

def spawnProcess(String[] cmd, File directory) {
  try {
    def cmdProcess = Runtime.getRuntime().exec(cmd, null, directory)
    def bufferedReader = new BufferedReader(new InputStreamReader(cmdProcess.getInputStream()))
    def buffered = ""
    def results = new StringBuffer()
    while ((buffered = bufferedReader.readLine()) != null) {
      results.append(buffered)
    }
    return results.toString()
  } catch (Exception exception) {
    rootProject.logger.error "Spawned process '${cmd}' threw an error"
    throw exception
  }
}

def readPackageFromJavaOrKotlinFile(String filePath) {
  def file = new File(filePath)
  def fileReader = new BufferedReader(new FileReader(file))
  def fileContent = ""
  while ((fileContent = fileReader.readLine()) != null) {
    def match = fileContent =~ /^package ([0-9a-zA-Z._]*);?$/
    if (match.size() == 1 && match[0].size() == 2) {
      fileReader.close()
      return match[0][1]
    }
  }
  fileReader.close()

  throw new GradleException("Java or Kotlin file $file does not include package declaration")
}

def readFromBuildGradle(String file) {
  def gradleFile = new File(file)
  if (!gradleFile.exists()) {
    return [:]
  }
  def fileReader = new BufferedReader(new FileReader(gradleFile))
  def result = [:]
  for (def line = fileReader.readLine(); line != null; line = fileReader.readLine()) {
    def versionMatch = line.trim() =~ /^version ?= ?'([\w.-]+)'$/
    def groupMatch = line.trim() =~ /^group ?= ?'([\w.]+)'$/
    if (versionMatch.size() == 1 && versionMatch[0].size() == 2) {
      result.version = versionMatch[0][1]
    }
    if (groupMatch.size() == 1 && groupMatch[0].size() == 2) {
      result.group = groupMatch[0][1]
    }
  }
  fileReader.close()
  return result
}

def findDefaultBasePackage(String packageDir) {
  def pathsJava = new FileNameFinder().getFileNames(packageDir, "android/src/**/*Package.java")
  def pathsKt = new FileNameFinder().getFileNames(packageDir, "android/src/**/*Package.kt")
  def paths = pathsJava + pathsKt

  if (paths.size != 1) {
    return []
  }

  def packageName = readPackageFromJavaOrKotlinFile(paths[0])
  def className = new File(paths[0]).getName().split(Pattern.quote("."))[0]
  return ["$packageName.$className"]
}

def generateBasePackageList(List<Unimodule> unimodules, String appPath) {
  def findMainJavaApp = new FileNameFinder().getFileNames(rootProject.getProjectDir().getPath(), appPath + '**/MainApplication.java', '')
  def findMainKtApp = new FileNameFinder().getFileNames(rootProject.getProjectDir().getPath(), appPath + '**/MainApplication.kt', '')
  
  if (findMainJavaApp.size() != 1 && findMainKtApp.size() != 1) {
    throw new GradleException("You need to have MainApplication in your project")
  }

  def findMainApp = (findMainJavaApp.size() == 1) ? findMainJavaApp : findMainKtApp
  def mainAppDirectory = new File(findMainApp[0]).parentFile
  def packageName = readPackageFromJavaOrKotlinFile(findMainApp[0])

  def fileBuilder = new StringBuilder()
  fileBuilder.append("package ${packageName}.generated;\n\n")

  fileBuilder.append("import java.util.Arrays;\n")
  fileBuilder.append("import java.util.List;\n")
  fileBuilder.append("import org.unimodules.core.interfaces.Package;\n\n")

  fileBuilder.append("public class BasePackageList {\n")
  fileBuilder.append("  public List<Package> getPackageList() {\n")
  fileBuilder.append("    return Arrays.<Package>asList(\n")
  def isEmptyList = true
  for (module in unimodules) {
    for (pkg in module.androidPackages) {
      fileBuilder.append("        new $pkg(),\n")
      isEmptyList = false
    }
  }
  if (!isEmptyList) {
    fileBuilder.deleteCharAt(fileBuilder.length() - 2) // remove last comma in a list
  }
  fileBuilder.append("    );\n")
  fileBuilder.append("  }\n")
  fileBuilder.append("}\n")


  new File(mainAppDirectory, "generated").mkdirs()
  def javaFile = new File(mainAppDirectory, "generated/BasePackageList.java")
  javaFile.createNewFile()
  def javaFileWriter = new BufferedWriter(new FileWriter(javaFile))
  javaFileWriter.write(fileBuilder.toString())
  javaFileWriter.close()
}


def findUnimodules(String target, List exclude, List modulesPaths) {
  def unimodules = [:]
  def unimodulesDuplicates = []

  for (modulesPath in modulesPaths) {
    def baseDir = new File(rootProject.getBuildFile(), modulesPath).toString()
    def moduleConfigPaths = new FileNameFinder().getFileNames(baseDir, '**/unimodule.json', '')

    for (moduleConfigPath in moduleConfigPaths) {
      def unimoduleConfig = Paths.get(moduleConfigPath).toRealPath().toFile()
      def unimoduleJson = new JsonSlurper().parseText(unimoduleConfig.text)
      def directory = unimoduleConfig.getParent()
      def buildGradle = readFromBuildGradle(new File(directory, "android/build.gradle").toString())
      def packageJsonFile = new File(directory, 'package.json')
      def packageJson = new JsonSlurper().parseText(packageJsonFile.text)

      def unimodule = new Unimodule()
      unimodule.name = unimoduleJson.name ?: packageJson.name
      unimodule.directory = directory
      unimodule.version = buildGradle.version ?: packageJson.version ?: "UNVERSIONED"
      unimodule.androidGroup = buildGradle.group ?: "org.unimodules"
      unimodule.androidSubdirectory = unimoduleJson.android?.subdirectory ?: "android"
      unimodule.platforms = unimoduleJson.platforms != null ? unimoduleJson.platforms : []
      assert unimodule.platforms instanceof List
      unimodule.targets = unimoduleJson.targets != null ? unimoduleJson.targets : []
      assert unimodule.targets instanceof List
      unimodule.androidPackages = unimoduleJson.android?.packages != null ?
          unimoduleJson.android.packages : findDefaultBasePackage(directory)
      assert unimodule.androidPackages instanceof List

      if (unimodule.supportsPlatform('android') && unimodule.supportsTarget(target)) {
        if (!exclude.contains(unimodule.name)) {
          if (unimodules[unimodule.name]) {
            unimodulesDuplicates.add(unimodule.name)
          }

          if (!unimodules[unimodule.name] ||
              VersionNumber.parse(unimodule.version) >= VersionNumber.parse(unimodules[unimodule.name].version)) {
            unimodules[unimodule.name] = unimodule
          }
        }
      }
    }
  }
  return [
      unimodules: unimodules.collect { entry -> entry.value },
      duplicates: unimodulesDuplicates.unique()
  ]
}


class Colors {
  static final String NORMAL = "\u001B[0m"
  static final String RED = "\u001B[31m"
  static final String GREEN = "\u001B[32m"
  static final String YELLOW = "\u001B[33m"
  static final String MAGENTA = "\u001B[35m"
}

def addUnimodulesDependencies(String target, List exclude, String appPath, List modulesPaths, Closure<Boolean> addUnimodule) {
  if (!(new File(project.rootProject.projectDir.parentFile, 'package.json').exists())) {
    // There's no package.json
    throw new GradleException(
        "'addUnimodulesDependencies()' is being used in a project that doesn't seem to be a React Native project."
    )
  }

  def results = findUnimodules(target, exclude, modulesPaths)
  def unimodules = results.unimodules
  def duplicates = results.duplicates
  generateBasePackageList(unimodules, appPath)

  if (unimodules.size() > 0) {
    println()
    println Colors.YELLOW + 'Installing unimodules:' + Colors.NORMAL
    for (unimodule in unimodules) {
      println ' ' + Colors.GREEN + unimodule.name + Colors.YELLOW + '@' + Colors.RED + unimodule.version + Colors.NORMAL + ' from ' + Colors.MAGENTA + unimodule.directory + Colors.NORMAL
      addUnimodule(unimodule)
    }

    if (duplicates.size() > 0) {
      println()
      println Colors.YELLOW + 'Found some duplicated unimodule packages. Installed the ones with the highest version number.' + Colors.NORMAL
      println Colors.YELLOW + 'Make sure following dependencies of your project are resolving to one specific version:' + Colors.NORMAL

      println ' ' + duplicates
          .collect { unimoduleName -> Colors.GREEN + unimoduleName + Colors.NORMAL }
          .join(', ')
    }
  } else {
    println()
    println Colors.YELLOW + "No unimodules found. Are you sure you've installed JS dependencies?" + Colors.NORMAL
  }
}

ext.addUnimodulesDependencies = { Map customOptions = [:] ->
  def options = [
      modulesPaths : ['../../node_modules'],
      configuration: 'implementation',
      target       : 'react-native',
      exclude      : [],
      appPath      : ''
  ] << getAndroidConfig(rootProject.projectDir) << customOptions
  addUnimodulesDependencies(options.target, options.exclude, options.appPath, options.modulesPaths, {unimodule ->
    Object dependency = project.project(':' + unimodule.name)
    project.dependencies.add(options.configuration, dependency)
  })
}

ext.addMavenUnimodulesDependencies = { Map customOptions = [:] ->
  def options = [
      modulesPaths : ['../../node_modules'],
      configuration: 'implementation',
      target       : 'react-native',
      exclude      : [],
  ] << getAndroidConfig(rootProject.projectDir) << customOptions

  addUnimodulesDependencies(options.target, options.exclude, options.modulesPaths, {unimodule ->
    project.dependencies.add(
        options.configuration,
        "${unimodule.androidGroup}:${unimodule.name}:${unimodule.version}"
    )
  })
}

ext.includeUnimodulesProjects = { Map customOptions = [:] ->
  def options = [
      modulesPaths: ['../../node_modules'],
      target      : 'react-native',
      exclude     : [],
  ] << getAndroidConfig(rootProject.projectDir) << customOptions

  def unimodules = findUnimodules(options.target, options.exclude, options.modulesPaths).unimodules

  for (unimodule in unimodules) {
    include ":${unimodule.name}"
    project(":${unimodule.name}").projectDir = new File(unimodule.directory, unimodule.androidSubdirectory)
  }
}
