import { Component, OnInit, ViewChild } from '@angular/core';
import {OrderServiceClient} from '../../../services/order.service.client';
import {ActivatedRoute, Router} from '@angular/router';
import {BusinessServiceClient} from '../../../services/business.service.client';
import {ServiceClient} from '../../../services/service.client';
import {OrderItemServiceClient} from '../../../services/orderItem.service.client';
import {UserServiceClient} from '../../../services/user.service.client';
import {SharedService} from '../../../services/shared.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-owner-order-detail',
  templateUrl: './owner-order-detail.component.html',
  styleUrls: ['./owner-order-detail.component.css']
})
export class OwnerOrderDetailComponent implements OnInit {
  @ViewChild('f') orderDetailsForm: NgForm;
  businessId: string;
  order: {};
  orderId: string;
  status: string;
  total: Number;
  subTotal: Number;
  user = {};
  items = [];
  services = [];
  tax: Number;
  visitCharges: Number;
  image: any;
  business = {};
  address = {};
  loading = false;
  internalBusiness = {};
  yelpId: string;
  staffs = [];

  constructor(private orderService: OrderServiceClient,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private businessService: BusinessServiceClient,
              private sharedService: SharedService,
              private userService: UserServiceClient,
              private serviceClient: ServiceClient,
              private orderItemService: OrderItemServiceClient) { }

  ngOnInit() {
    this.loading = true;
    this.user = this.sharedService.user;
    this.activatedRoute.params
      .subscribe(
        (params: any) => {
          this.businessId = params['businessId'];
          this.orderId = params['id'];
          this.loadOrders();
        });
    this.loadOrderItems();

    this.serviceClient.findServices(this.businessId, '')
      .subscribe( (services) => {
        this.services = services;
      });

    this.userService.findStaffsByBusinessId(this.businessId)
      .subscribe( (staffs) => {
        this.staffs = staffs;
      });
  }

  loadOrders() {
    this.orderService.findOrderByBusinessIdAndOrderId(this.orderId, this.businessId)
      .subscribe(
        (order: any) => {
          this.order = order;
          this.total = order['total'];
          this.subTotal = order['sub_total'];
          this.status = order['status'];
          this.visitCharges = order['visitCharges'];
          this.tax = order['tax'];
        });
  }

  loadOrderItems() {
    this.orderItemService.findOrderItemsByOrder(this.orderId)
      .subscribe( (items) => {
        this.items = items;
      });
  }
  updateOrder(price) {
    const order = {
      sub_total: this.subTotal + price,
      total: this.total + price
    };
    this.orderService.updateOrder(this.orderId, this.businessId, order)
      .subscribe( (orderItem) => {
        this.loadOrders();
        this.loading = false;
      });
  }

  add(sItem: any) {
    this.loading = true;
    const item = {
      quantity: 1,
      name: sItem.name,
      price: sItem.price,
      order_id: this.orderId
    };
    this.orderItemService.createOrderItem(this.orderId, item)
      .subscribe( (orderItem) => {
        this.updateOrder(item.price);
        this.loadOrderItems();
      });
  }

  addQuantity(oItem: any) {
    this.loading = true;
    const addedPrice = oItem.price / oItem.quantity;
    const item = {
      quantity: oItem.quantity + 1,
      price: oItem.price + addedPrice
    };
    this.orderItemService.updateOrderItem(this.orderId, oItem.id, item)
      .subscribe( (status) => {
        this.updateOrder(addedPrice);
        this.loadOrderItems();
      });
  }

  reduceQuantity(oItem: any) {
    this.loading = true;
    const reducedPrice = oItem.price / oItem.quantity;
    const item = {
      quantity: oItem.quantity - 1,
      price: oItem.price - reducedPrice
    };
    if (item.price <= 0) {
      this.deleteItem(oItem);
    } else {
      this.orderItemService.updateOrderItem(this.orderId, oItem.id, item)
        .subscribe( (status) => {
          this.updateOrder(-reducedPrice);
          this.loadOrderItems();
        });
    }
  }

  cancelOrder() {
    this.order['status'] = 'rejected';
    this.orderService.updateOrder(this.orderId, this.businessId, this.order)
      .subscribe(
        (order: any) => {
          this.router.navigate(['/owner', 'business', this.businessId, 'order']);
        }
      );
  }

  assignStaff() {
    const staffId = this.orderDetailsForm.value.staffId;
    this.order['staff_id'] = staffId;

    this.orderService.updateOrder(this.orderId, this.businessId, this.order)
      .subscribe( (updatedOrder: any) => {
        this.order = updatedOrder;
      });

  }

  deleteItem(oItem: any) {
    this.loading = true;
    this.orderItemService.deleteOrderItem(this.orderId, oItem.id)
      .subscribe( (status) => {
        this.updateOrder(-oItem.price);
        this.loadOrderItems();
      });
  }

  logout() {
    this.userService.logout()
      .subscribe(
        (data: any) => this.router.navigate(['/login'])
      );
  }

}
