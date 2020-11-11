import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Comment } from '../shared/comment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  newComment: Comment;
  errMess: string;

  @ViewChild('fform') commentsFormDirective;
  commentsForm: FormGroup;

  formErrors ={
    'author': '',
    'rating': '',
    'comment': ''
  }

  validationMessages = {
    'author': {
      'required':      'Author Name is required.',
      'minlength':     'Author Name must be at least 2 characters long.'
    },
    'comment': {
      'required':      'Comment is required.',
      'minlength':     'Comment must be at least 2 characters long.'
    },
  };

  constructor(private dishservice: DishService,
              private route: ActivatedRoute,
              private location: Location,
              private cf: FormBuilder,
              @Inject('BaseURL') private BaseURL)
  {
    this.createForm();
  }

  createForm(){
    this.commentsForm = this.cf.group({
      author: ['', [Validators.required, Validators.minLength(2)] ],
      rating: 5,
      comment: ['', [Validators.required, Validators.minLength(2)] ]
    });

    this.commentsForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)  set form validation messages

  }

  onSubmit(){

    this.newComment = this.commentsForm.value;

    this.newComment.date= new Date().toISOString();

    this.dish.comments.push(this.newComment);

    this.commentsFormDirective.resetForm({
      author: '',
      rating: 5,
      comment: ''
    });
  }

  onValueChanged (data?: any){
    if(!this.commentsForm){
      return;
    }

    const form = this.commentsForm;

    for(const field in this.formErrors){
      if(this.formErrors.hasOwnProperty(field)){
        //clear previous error message (if any)

        this.formErrors[field] = '';
        const control = form.get(field);

        if(control && control.dirty && !control.valid){
          const messages = this.validationMessages[field];

          for(const key in control.errors){
            if(control.errors.hasOwnProperty(key)){
              this.formErrors[field] += messages[key] + '';
            }
          }
        }
      }
    }
  }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishservice
      .getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); },
      errmess => this.errMess = <any>errmess);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds
      .length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds
      .length];
  }

  goBack(): void {
    this.location.back();
  }

}
