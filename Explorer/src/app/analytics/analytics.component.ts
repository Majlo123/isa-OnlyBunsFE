import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
})
export class AnalyticsComponent implements OnInit {
  // Podaci o statistici
  postCount: number = 0;
  commentCount: number = 0;
  totalUsers: number = 0;
  usersWithPosts: number = 0;
  usersWithComments: number = 0;
  inactivePercentage: number = 0; // Procenat neaktivnih korisnika

  // Vremenski period
  selectedPeriod: string = 'yearly'; // Default: godišnji nivo

  // Postavke grafikona
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true, // Grafikon odgovara promeni veličine prozora
    maintainAspectRatio: false, // Isključuje forsiranje proporcija
    plugins: {
      legend: {
        position: 'top', // Pozicija legende
      },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
      },
    },
  };

  // Etikete grafikona
  public pieChartLabels = ['Posting %', 'Commenting %', 'Inactive %']; // Dodata etiketa za neaktivne

  // Podaci za grafikon
  public pieChartData: ChartData<'pie'> = {
    labels: this.pieChartLabels,
    datasets: [
      {
        data: [], // Podaci se postavljaju kasnije
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'], // Boje grafikona
        hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D'], // Hover boje
      },
    ],
  };

  constructor(private http: HttpClient) {}

  // Inicijalizacija pri učitavanju komponente
  ngOnInit(): void {
    this.updateAnalytics(); // Učitavanje podataka
    setTimeout(() => {
      window.dispatchEvent(new Event('resize')); // Forsira osvežavanje grafikona
    }, 300); // Mali delay zbog sigurnosti
  }

  // Promena perioda (poziva ažuriranje podataka)
  onPeriodChange() {
    this.updateAnalytics();
  }

  // Izračunavanje datuma na osnovu perioda
  getStartAndEndDate(): { startDate: string; endDate: string } {
    const today = new Date();
    let startDate = new Date();

    // Određivanje vremenskog perioda
    if (this.selectedPeriod === 'weekly') {
      startDate.setDate(today.getDate() - 7);
    } else if (this.selectedPeriod === 'monthly') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (this.selectedPeriod === 'yearly') {
      startDate.setFullYear(today.getFullYear() - 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0], // Format YYYY-MM-DD
      endDate: today.toISOString().split('T')[0], // Format YYYY-MM-DD
    };
  }

  // Učitavanje analitike sa servera
  updateAnalytics() {
    const token = localStorage.getItem('accessToken'); // Dohvati token iz localStorage
    const headers = { Authorization: `Bearer ${token}` };

    // Uzimanje datuma
    const { startDate, endDate } = this.getStartAndEndDate();

    // HTTP zahtev
    this.http
      .get<any>(`http://localhost:8080/api/admin/analytics?startDate=${startDate}&endDate=${endDate}`, { headers })
      .subscribe({
        next: (data) => {
          // Postavljanje podataka
          this.postCount = data.postCount;
          this.commentCount = data.commentCount;
          this.totalUsers = data.totalUsers;
          this.usersWithPosts = data.usersWithPosts;
          this.usersWithComments = data.usersWithComments;
          this.inactivePercentage = data.inactivePercentage; // Procenat neaktivnih korisnika

          // Provera podataka u konzoli
          console.log('Podaci za grafikon:', {
            postingPercentage: data.postingPercentage,
            commentingPercentage: data.commentingPercentage,
            inactivePercentage: data.inactivePercentage, // Proveri neaktivne
          });

          // Proveri validnost podataka pre postavljanja
          const postingPercentage = data.postingPercentage || 0;
          const commentingPercentage = data.commentingPercentage || 0;
          const inactivePercentage = data.inactivePercentage || 0;

          // Ažuriranje grafikona sa podacima
          this.pieChartData = {
            labels: ['Posting %', 'Commenting %', 'Inactive %'], // Ažurirane etikete
            datasets: [
              {
                data: [
                  postingPercentage,
                  commentingPercentage,
                  inactivePercentage, // Dodaj procenat neaktivnih
                ],
                backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'], // Boje grafikona
                hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D'], // Hover efekat
              },
            ],
          };
        },
        error: (err) => {
          console.error('Error fetching analytics:', err); // Loguj grešku
        },
      });
  }
}
