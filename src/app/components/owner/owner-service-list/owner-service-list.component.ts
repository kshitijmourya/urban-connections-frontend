import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {SharedService} from '../../../services/shared.service';
import {ServiceClient} from '../../../services/service.client';

@Component({
  selector: 'app-owner-service-list',
  templateUrl: './owner-service-list.component.html',
  styleUrls: ['./owner-service-list.component.css']
})
export class OwnerServiceListComponent implements OnInit {
  services = [];
  user = {};
  businessId: String;

  constructor(private activatedRoute: ActivatedRoute,
              private sharedService: SharedService,
              private router: Router,
              private serviceClient: ServiceClient) { }

  ngOnInit() {
    this.user = this.sharedService.user;
    if (this.user['type'] !== 'Owner') {
      this.router.navigate(['/']);
    }
    this.activatedRoute.params
      .subscribe(
        (params: any) => {
          this.businessId = params['businessId'];
        }
      );
    this.serviceClient.findServices(this.businessId, 'owner')
      .subscribe(
        (services: any) => {
          this.services = services;
        }
      );
  }
}
