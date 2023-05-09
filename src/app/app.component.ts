import { Component, OnInit } from '@angular/core';
import awsconfig from './../aws-exports';
import { Auth, Amplify } from 'aws-amplify';
import { Hub } from 'aws-amplify';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'aws-rekognition-liveness-detection-angular';
  load_face_live = false;
  ngOnInit(): void {
    Amplify.configure(awsconfig);
    Auth.configure(awsconfig);
    Hub.listen('auth', this.listener)
    this.load_face_live = true;
    console.log('component-loaded')
  }

  signOut(): void {
    this.load_face_live = false;
    setTimeout(() => {
      Auth.signOut();
    }, 3);
  }

  listener = (data) => {
    switch (data.payload.event) {
      case 'signIn':
        console.log('user signed in');
        this.load_face_live = true;
        break;
    }
  };

  
}
