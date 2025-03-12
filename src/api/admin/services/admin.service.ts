// import { Injectable } from '@nestjs/common';
// import * as google from 'googleapis';

// const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

// const auth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
// });

// @Injectable()
// export class AdminService {
//   constructor() {}
//   async getDashboardAnalytics() {
//     const analytics = google.analyticsreporting_v4({
//       version: 'v4',
//       auth,
//     });

//     const response = await analytics.reports.batchGet({
//       requestBody: {
//         reportRequests: [
//           {
//             viewId: 'YOUR_VIEW_ID', // Replace with your GA4 View ID
//             dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
//             metrics: [{ expression: 'ga:activeUsers' }],
//           },
//         ],
//       },
//     });

//     return response.data;
//   }
// }
