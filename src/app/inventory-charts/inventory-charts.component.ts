import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as XLSX from 'xlsx';
import * as moment from 'moment';

@Component({
  selector: 'app-inventory-charts',
  templateUrl: './inventory-charts.component.html',
  styleUrls: ['./inventory-charts.component.css']
})
export class InventoryChartsComponent implements OnInit {

  file: File | any;
  arrayBuffer: any;
  fileList: any;
  fileTemp: any;

  productsData: any[] = [];
  requiredProductsData: any[] = [];
  pieChartData: any[] = []
  data: any[] = [];
  batchesArr: any[] = [];
  nameArr: any[] = [];
  barChartData: any[] = [];
  view: [number, number] = [700, 400];


  columns: any = {};
  options: any = {}

  selectedName: string = '';
  selectedNameForBarChart: string = '';
  selectedBatch: string = '';
  xAxisLabel: string = 'Product Names';
  yAxisLabel: string = 'Count';
  legendPosition: string = 'below';



  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = true;
  timeline: boolean = true;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  isLoading: boolean = false;

  colorSchemeForPie = {
    domain: ['#5AA454', '#A10A28']
  }
  colorSchemeForBar = {
    domain: ['#C7B42C', '#AAAAAA', "#000000", "#0000FF", "#00FFFF", "#dc143c", "#8a2be2", "#ffb6c1", "#87cefa", "#9acd32", "#9370db", "#a52a2a"]
  };


  selectedNameIndex: any = -1;


  selectedDate: Date = new Date();


  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getDataFromFile();
  }

  /** Get date from the file from the assets folder */
  getDataFromFile() {
    this.isLoading = true;
    this.http.get('assets/datasource/Sample_Inventory.xlsx', { responseType: "blob" }).subscribe((data: any) => {
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(data);
      fileReader.onload = (e) => {
        this.isLoading = false;
        this.arrayBuffer = fileReader.result;
        var data = new Uint8Array(this.arrayBuffer);
        var arr = new Array();
        for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);

        var bstr = arr.join("");
        var workbook = XLSX.read(bstr, { type: "binary", cellDates: true });
        var first_sheet_name = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[first_sheet_name];
        this.productsData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        let result = this.productsData.reduce((unique, obj) => {
          if (!unique.some((o: any) => o.company == obj.company)) {
            obj.exp = obj.exp.setDate(obj.exp.getDate() + 1);;
            let temp = {
              company: obj.company,
              items: [obj]
            }
            unique.push(temp);
          } else {
            let index = unique.findIndex((item: any) => item.company == obj.company);
            if (index > -1) {
              obj.exp = obj.exp.setDate(obj.exp.getDate() + 1);
              unique[index].items.push(obj);
            }
          }
          return unique;
        }, []);
        this.nameArr = [];
        this.productsData.forEach((item) => {
          let i = this.nameArr.findIndex(d => d == item.company);
          if (i < 0) {
            this.nameArr.push(item.company);
          }
        })
        this.selectedName = this.nameArr[0];
        this.selectedNameForBarChart = this.nameArr[0];
        this.requiredProductsData = result;
        this.pieChartData = this.dateExpiryProdctsData(this.selectedName);
        this.data = this.productsData;
        this.expiredProductsDetails(this.selectedNameForBarChart, this.selectedDate);
      };

    }, err => {
      this.isLoading = false;
    })
  }

  dateExpiryProdctsData(name: any) {

    let index = this.requiredProductsData.findIndex((item: any) => item.company == name);
    let items = this.requiredProductsData[index].items;
    let arr = [
      {
        name: 'Not-Expired',
        value: 0
      },
      {
        name: 'Expired',
        value: 0
      }
    ]
    items.forEach((data: any) => {
      let currentDate = new Date().getTime();
      if (currentDate > data.exp) {
        ++arr[1].value
      } else {
        ++arr[0].value
      }
    })
    return arr;
  }

  onNameChange() {
    this.pieChartData = this.dateExpiryProdctsData(this.selectedName);
  }

  onNameChangeForBarChart() {
    this.expiredProductsDetails(this.selectedNameForBarChart, this.selectedDate);
  }

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  expiredProductsDetails(name: any, date: any) {
    let selectedDateInSeconds = date.getTime();

    let index = this.requiredProductsData.findIndex((item: any) => item.company == name);

    if (index > -1) {
      let productsArr = this.requiredProductsData[index].items;
      let arr: any[] = [];

      productsArr.forEach((item: any) => {
        if (item.exp < selectedDateInSeconds) {
          arr.push(item);
        }
      });
      if (arr.length > 0) {
        let allProdcutsValues = arr.reduce((tempAArr, o) => {

          if (!tempAArr.some((obj: any) => obj.name == o.name)) {

            let obj = {
              name: o.name,
              value: [o]
            }

            tempAArr.push(obj);

          } else {
            let index = tempAArr.findIndex((item: any) => item.name == o.name);
            if (index > -1)
              tempAArr[index].value.push(o);
          }
          return tempAArr;
        }, []);

        let finalArr = allProdcutsValues.map((item: any) => {
          let obj = {
            name: item.name,
            value: item.value.length
          }
          return obj;
        });
        this.barChartData = finalArr;

      } else {
        let obj = {
          name: '',
          value: 0
        }
        this.barChartData = [obj];
      }

    }

  }

  onDateChange(event: any) {
    this.expiredProductsDetails(this.selectedNameForBarChart, moment(event.target.value, 'YYYY-MM-DD').toDate());
  }

}
