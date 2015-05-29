---
layout: post
title: HAXM와 Atom x86 이미지로 안드로이드 에뮬레이터 속도 빠르게 하기
category: android
tags: [android, x86, atom, haxm]
comments: true
redirect_from: /187/
---

## 서론

![](http://cfile9.uf.tistory.com/image/12415D3950494A2226E71F)

안드로이드 앱을 개발하면 느린 안드로이드 에뮬레이터 때문에 답답함을 느끼는 개발자가 많을 것이다. 그렇다고 안드로이드 공기계를 구입해서 개발하는 여유가 없다면 안드로이드 개발에 대해서 크게 실망하고 있을지도 모르겠다. 그래서 학생이나 안드로이드 앱 개인 개발자들에게 도움이 되길 바라는 마음에 "안드로이드 앱 개발시 느린 에뮬레이터 대신 Android x86을 이용해서 개발환경 구축하기" 라는 글을 포스팅 했었다. 이 글의 내용은 안드로이드 에뮬레이터를 사용하는 것이 아니라 Virtual Machine 인 VirtualBox에 Android x86 이미지를 사용해서 가상머신으로 안드로이드 운영체제를 설치해서 느린 안드로이드 에뮬레이터 대신에 개발할 때 사용하는 방법이다. 이 포스팅이 작성되고 페이스북에서 몇가지 피드백을 받게 되었다. 박태웅 부사장님께서 Intel에서 배포하는 Atom x86 용  Android Image를 사용하는 방법을 링크로 가르쳐주셨다. 이 실험을 다하고 지나고 난 다음에 이제서야 부사장님의 링크가 무슨 의미인지 알게 되었지만,  이때까지만 해도 Atom x86 이미지를 사용한다고 하더라도 느린 에뮬레이터 문제 때문에 속도 문제는 여전할거라는 주장을 가지고 있었다. 그리고 박성서 대표님께서 안드로이드 에뮬레이터가 JVM의 문제가 아니라 QEMU 가상머신 때문이라는 것을  가르쳐주셨고, 안드로이드의 QEMU 가상머신을 HAXM을 이용해서 가속도를 낼 수 있다고 의견을 주셨다. 그래서 다음날 아침 연구소에 출근하자말자 HAXM에 대해서 조사하고 실험에 들어갔다.


## HAXM(Hardware Accelerated Execution Manager)

HAXM을 이용해서 안드로이드 앱을 개발할 때의 이점은 다음 링크에서 동영상으로 이해하는데 도움을 받을 수 있다.
[The Benefits of Developing Android Apps with the Intel® Hardware Accelerated Execution Manager](http://software.intel.com/en-us/video/the-benefits-of-developing-android-apps-with-the-intel-hardware-accelerated-execution-manager?&CCID=20214700204366378&QTR=ZZf201208300721490Za20214700Zg255Zw0Zm0Zc204366378Zs8986ZZ&CLK=173120906181523222&WT.qs_dlk=UElJ1QrIZ2MAAAGsXmcAAAAn&&exp=y)


인텔 하드웨어 가속 실행 관리자 (인텔 ® HAXM)는 호스트 컴퓨터에서 Android 앱 에뮬레이션 속도를 인텔 가상화 기술 (인텔 ® VT)을 사용하는 하드웨어 지원 가상화 엔진이다. 기존의 CPU 가상화만 사용해서 QEMU 가상 머신에 동작하는 안드로이드 에뮬레이터에 HAXM driver가 지원이되어 하드웨어 가속도 가상화를 지원하게 되는 것인데 HAXM을 사용할 때와 사용하지 않을 때의 속도 차이는 위 동영상 뿐만 아니라 아래 자료에서 활인할 수 있다.

HAXM을 사용할 때와 사용하지 않았을때 부팅 속도를 비교하는 것이다. 안드로이드 에뮬레이터는 기본적으로 최초 부팅이 이후 부팅보다 조금 더 오래 걸린다. 빨간색으로 된 부분이 XHAM을 사용했을때 인데 부팅 시간차이가 많이 나는 것을 확인할 수 있다.


![](http://cfile1.uf.tistory.com/image/134E873450494D5235639A)
http://www.developer.com/ws/android/development-tools/haxm-speeds-up-the-android-emulator.html

## HAXM 설치

이제 HAXM을 설치해보도록 하자. 다음 링크에서 자신의 운영체제에 사용할 수 있는 HAXM 을 다운받아서 설치한다.

http://software.intel.com/en-us/articles/intel-hardware-accelerated-execution-manager/

![](http://cfile7.uf.tistory.com/image/1424853850494F1D37A1BE)

![](http://cfile2.uf.tistory.com/image/11485D3B50494F390B66F5)

다른 가상화 머신을 설치할 때와 마찬가지로 HAXM 도 메모리 사용에 대한 설정이 있다.

![](http://cfile7.uf.tistory.com/image/1361023850494F7B051998)

설치가 되었으면 터미널을 열어서 다음과 같이 haxm 로드 되어 있는지 확인한다.

```
kextstat | grep intel
```

![](http://cfile28.uf.tistory.com/image/20558236504952370718D8)

이렇게 com.intel.kext.intelhaxm이 로드된 것을 확인할 수 있다.
만약 HAXM을 사용하고 싶지 않을 경우에는 kextunload를 다시 사용할 때는 kextload 명령어를 사용한다.

```
sudo kextunload -b com.intel.kext.intelhaxm
```

```
sudo kextload -b com.intel.kext.intelhaxm
```
