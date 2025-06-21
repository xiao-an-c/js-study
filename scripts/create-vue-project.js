#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 获取命令行参数
const projectName = process.argv[2]

if (!projectName) {
  console.error('❌ 请提供项目名称!')
  console.log('用法: node scripts/create-vue-project.js <project-name>')
  console.log('示例: node scripts/create-vue-project.js my-vue-app')
  process.exit(1)
}

// 验证项目名称
if (!/^[a-z0-9-]+$/.test(projectName)) {
  console.error('❌ 项目名称只能包含小写字母、数字和连字符!')
  process.exit(1)
}

const templateDir = path.join(__dirname, '../templates/vue3-vite-ts')
const targetDir = path.join(__dirname, '../packages', projectName)

// 检查模板是否存在
if (!fs.existsSync(templateDir)) {
  console.error('❌ 模板目录不存在:', templateDir)
  process.exit(1)
}

// 检查目标目录是否已存在
if (fs.existsSync(targetDir)) {
  console.error(`❌ 项目 "${projectName}" 已存在!`)
  process.exit(1)
}

console.log(`🚀 正在创建 Vue3 + Vite + TypeScript 项目: ${projectName}`)

// 复制模板文件
function copyTemplate(src, dest) {
  const stat = fs.statSync(src)
  
  if (stat.isDirectory()) {
    // 创建目录
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }
    
    // 递归复制子文件/目录
    const files = fs.readdirSync(src)
    files.forEach(file => {
      copyTemplate(path.join(src, file), path.join(dest, file))
    })
  } else {
    // 复制文件并替换模板变量
    let content = fs.readFileSync(src, 'utf8')
    content = content.replace(/{{PROJECT_NAME}}/g, projectName)
    fs.writeFileSync(dest, content)
  }
}

try {
  // 复制模板
  copyTemplate(templateDir, targetDir)
  
  console.log('✅ 项目文件创建完成!')
  console.log('📦 正在安装依赖...')
  
  // 安装依赖
  process.chdir(targetDir)
  execSync('pnpm install', { stdio: 'inherit' })
  
  console.log('\n🎉 项目创建成功!')
  console.log('\n📁 项目位置:', targetDir)
  console.log('\n🚀 开始开发:')
  console.log(`   cd packages/${projectName}`)
  console.log('   pnpm dev')
  console.log('\n📚 学习资源:')
  console.log('   - Vue 3: https://cn.vuejs.org/')
  console.log('   - Vite: https://cn.vitejs.dev/')
  console.log('   - TypeScript: https://www.typescriptlang.org/zh/')
  
} catch (error) {
  console.error('❌ 创建项目时出错:', error.message)
  
  // 清理失败的项目目录
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true })
  }
  
  process.exit(1)
}