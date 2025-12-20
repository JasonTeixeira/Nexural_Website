#!/usr/bin/env node

/**
 * Quick Health Check Test Script
 * Run this to test if your server and health endpoint work
 */

const http = require('http');

const PORT = process.env.PORT || 3036;
const HOST = 'localhost';

console.log('🔍 Testing Health Endpoint...\n');
console.log(`Testing: http://${HOST}:${PORT}/api/health\n`);

const options = {
  hostname: HOST,
  port: PORT,
  path: '/api/health',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  let data = '';

  console.log(`✅ Server responded with status: ${res.statusCode}\n`);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const healthData = JSON.parse(data);
      
      console.log('📊 Health Check Results:\n');
      console.log(`Overall Status: ${healthData.status}`);
      console.log(`Timestamp: ${healthData.timestamp}\n`);
      
      console.log('🔧 Services:\n');
      
      Object.entries(healthData.services).forEach(([service, status]) => {
        const icon = status.status === 'up' ? '✅' : '❌';
        console.log(`${icon} ${service.toUpperCase().padEnd(15)} ${status.status.toUpperCase()}`);
        if (status.responseTime) {
          console.log(`   Response Time: ${status.responseTime}ms`);
        }
        if (status.error) {
          console.log(`   Error: ${status.error}`);
        }
        if (status.details?.provider) {
          console.log(`   Provider: ${status.details.provider}`);
        }
        console.log('');
      });

      console.log('✨ Health check complete!\n');
      
      // Summary
      const upCount = Object.values(healthData.services).filter(s => s.status === 'up').length;
      const totalCount = Object.keys(healthData.services).length;
      
      console.log(`📈 Summary: ${upCount}/${totalCount} services are UP\n`);
      
      if (upCount === totalCount) {
        console.log('🎉 All systems operational! Ready to deploy!');
      } else {
        console.log('⚠️  Some services are down. Check the errors above.');
      }
      
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.log('\nRaw response:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Failed to connect to server!\n');
  console.error(`Error: ${error.message}\n`);
  console.log('💡 Make sure your development server is running:');
  console.log('   npm run dev\n');
  console.log(`   Then visit: http://${HOST}:${PORT}\n`);
  process.exit(1);
});

req.end();
