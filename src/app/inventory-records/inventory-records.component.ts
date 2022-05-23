import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import * as XLSX from 'xlsx';
import { Observable } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-inventory-records',
  templateUrl: './inventory-records.component.html',
  styleUrls: ['./inventory-records.component.css']
})
export class InventoryRecordsComponent implements OnInit {

  
  file: File | any;
  arrayBuffer: any;
  fileList: any;
  fileTemp: any;

  productsData: any[] = [];
  requiredProductsData: any[] = [];

  options = {}
  data: any[] = [];
  columns: any = {};

  selectedName: string = '';
  selectedBatch: string = '';

  batchesArr: any[] = [];
  nameArr: any[] = [];

  selectedNameIndex: any = -1;

  isLoading: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getDataFromFile();
    this.columns = [
      { key: 'name', title: "Name" },
      { key: 'batch', title: 'Batch' },
      { key: 'stock', title: 'Stock' },
      { key: 'deal', title: 'Deal' },
      { key: 'free', title: 'Free' },
      { key: 'mrp', title: 'MRP' },
      { key: 'rate', title: 'Rate' },
      { key: 'exp', title: 'Expiry Date' },
    ]
  }



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

          if (!unique.some((o: any) => o.name == obj.name)) {

            obj.exp = obj.exp.setDate(obj.exp.getDate() + 1);;
            let temp = {
              name: obj.name,
              items: [obj]
            }
            unique.push(temp);

          } else {
            let index = unique.findIndex((item: any) => item.name == obj.name);

            if (index > -1) {
              obj.exp = obj.exp.setDate(obj.exp.getDate() + 1);
              // obj.exp = moment(obj.exp,'DD/MM/YYYY').toDate().getTime();
              unique[index].items.push(obj);
            }
          }
          return unique;
        }, []);
        this.requiredProductsData = result;
        this.data = this.productsData;
        this.nameArr = [];
        this.productsData.forEach((item) => {
          let i = this.nameArr.findIndex(d => d == item.name);
          if (i < 0) {
            this.nameArr.push(item.name);
          }
        })
        this.selectedName = this.nameArr[0];
        this.onNameChange();
      };

    }, err => {
      this.isLoading = false;
    })
  }

  onNameChange() {
    this.selectedBatch = '';
    this.selectedNameIndex = this.requiredProductsData.findIndex((item) => item.name == this.selectedName);
    this.batchesArr = [];
    let totalItems: any[] = this.requiredProductsData[this.selectedNameIndex].items;
    totalItems.forEach(item => {
      this.batchesArr.push(item.batch);
    })
    this.batchesArr = [...new Set(this.batchesArr)];
    this.forAgrregation();
  }

  onBatchChange() {
    let nameIndex = this.requiredProductsData.findIndex((item: any) => item.name == this.selectedName);
    let selectedNameBatches = this.requiredProductsData[nameIndex];
    if (this.selectedBatch) {
      let filterItems = selectedNameBatches.items.filter((item: any) => {
        if (item.batch == this.selectedBatch) {
          item.exp = moment(item.exp).format('DD-MM-YYYY');
          return item;
        }
      })
      return this.data = filterItems;
    } else {
      this.onNameChange();
    }
  }

  forAgrregation() {
    let obj = {}
    if (this.selectedName) {
      let index = this.requiredProductsData.findIndex((item => item.name == this.selectedName));
      let prodcuts = this.requiredProductsData[index].items;
      obj = {
        name: this.selectedName,
        batch: 'ALL',
        stock: this.aggregateStocks(prodcuts),
        deal: this.minDealValue(prodcuts),
        free: this.minFreeValue(prodcuts),
        mrp: this.maxMRPValue(prodcuts),
        rate: this.maxRateValue(prodcuts),
        exp: this.nearestExpiryDate(prodcuts)
      }
    }

    this.data = [obj];
  }


  aggregateStocks(arr: any[]) {
    let totalStocks = 0;
    arr.map((item: any) => {
      totalStocks = totalStocks + item.stock;
    })
    return totalStocks;
  }

  minDealValue(arr: any[]) {

    arr.sort((a: any, b: any) => {
      return a.deal - b.deal;
    });
    return arr[0].deal;
  }

  minFreeValue(arr: any[]) {
    arr.sort((a: any, b: any) => {
      return a.free - b.free;
    });
    return arr[0].free;
  }

  maxRateValue(arr: any[]) {
    arr.sort((a: any, b: any) => {
      return a.rate - b.rate;
    });
    return arr[arr.length - 1].rate;
  }

  maxMRPValue(arr: any[]) {
    arr.sort((a: any, b: any) => {
      return a.mrp - b.mrp;
    });
    return arr[arr.length - 1].mrp;
  }

  nearestExpiryDate(arr: any[]) {

    arr.sort(function (a: any, b: any) {
      return b.exp - a.exp;
    })
      ;
    return moment(arr[arr.length - 1].exp).format('DD/MM/YYYY');
  }

}
