import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  postCount: number = 0;
  commentCount: number = 0;

  totalUsers: number = 0;
  usersWithPosts: number = 0;
  usersWithComments: number = 0;
  inactiveUsers: number = 0;

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
  };
  public pieChartLabels = ['Posts', 'Comments', 'Inactive'];
  public pieChartData: ChartData<'pie'> = {
    labels: this.pieChartLabels,
    datasets: [
      {
        data: [],
      },
    ],
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAnalytics('2023-01-01', '2023-12-31');
  }

  fetchAnalytics(startDate: string, endDate: string) {
    this.http
      .get<any>(`http://localhost:8080/api/admin/analytics?startDate=${startDate}&endDate=${endDate}`)
      .subscribe((data) => {
        this.postCount = data.postCount;
        this.commentCount = data.commentCount;
        this.totalUsers = data.totalUsers;
        this.usersWithPosts = data.usersWithPosts;
        this.usersWithComments = data.usersWithComments;
        this.inactiveUsers = data.inactiveUsers;

        // Postavi podatke za grafikon
        this.pieChartData.datasets[0].data = [
          this.usersWithPosts,
          this.usersWithComments,
          this.inactiveUsers,
        ];
      });
  }
}
