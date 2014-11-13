---
layout: post
title: jekyll-img-converter 플러그인 소개
category: jekyll
tags: [jekyll, ruby, markdown, plugin]
comments: true
---

> ***jekyll-img-converter***는 [Markdown](http://daringfireball.net/projects/markdown/syntax)의 이미지  문법(syntax)를 HTML으로 변환 시킬 때  이미지의 사이즈를 inline style로 추가해서 변환 시키는 [Jekyll](http://jekyllrb.com)의 플러그인이다.

## Jekyll과 Markdown

**Jekyll**은 정적 웹사이트를 제작할 수 있는 Ruby 기반 [static web page generator](http://en.wikipedia.org/wiki/Static_web_page) 프레임워크이다. 정적 웹 사이트는 동적 웹 사이트와 달리 데이터베이스가 필요하지 않고 호스트 비용을 절감하면서 빠르게 개발할 수 있기 때문에 개발자들 사이에서 큰 인기를 가지고 있는데 Jekyll은 정적 웹 사이트 생성도구 중에서 가장 많은 관심을 받고 있다. Jekyll을 사용하면 [Github Pages](https://pages.github.com)에 쉽게 개인 웹 사이트 및 블로그를 생성할 수 있기 때문에 Jekyll의 인기는 더욱 높아지고 있다. 웹 사이트를 만들기 위해서는 웹 서버가 필요한데 Github pages를 이용해서 Github의 서버로 비용없이 개인 웹 페이지를 만들 수 있기 때문이다. 보다 자세한 내용은 [Jekyll을 사용하여 GitHub Pages 만들기](http://blog.saltfactory.net/256) 글을 참조하면 된다. Jekyll의 또 다른 인기는 **Markdown**으로 생성한 문서를 웹 페이지로 자동으로 만들어주기 때문이다. Markdown은 문서를 제작하는데 집중할 수 있게 쉽게 문서를 제작할 수 있고 제작된 문서는 다양한 포멧으로 변경되거나 스타일을 적용할 수 있기 때문에 연구자나 개발자들에게 큰 인기를 갖게 되었다. **Jekyll**의 장점은 이미 많은 개발자들이 사용하고 있기 때문에 다양한 개발자들이 Jekyll을 사용하면서 필요한 **플러그인**을 개발하여 공개하고 Jekyll은 쉽게 플러그인을 설치하여 Jekyll의 기능을 확장시킬 수 있다. [Jekyll Plugins](http://jekyllrb.com/docs/plugins/)에서 Jekyll의 플러그인을 만드는 방법과 이미 만들어져있는 플러그인들의 목록을 살펴볼 수 있다. 뿐만 아니라 Github에서 Jekyll에 관련된 플러그인들을 많이 찾아볼 수 있고 Ruby의 패키지 관리 툴인 [gem](https://rubygems.org)을 사용해서 쉽게 플러그인을 설치할 수 있다.

## Markdown Syntax

Markdown의 문법은 문서를 작성하는데 집중하기 위해서 스타일을 적용하는 문법이 없이 간단한 표기법을 사용한다. [Markdown의 Syntax](http://daringfireball.net/projects/markdown/syntax)에 관련된 글을 살펴보면 스타일에 관련된 내용이 없다는 것을 확인할 수 있을 것이다. 하지만 [inline HTML](http://daringfireball.net/projects/markdown/syntax#html)을 사용할 수 있기도 하다. 우리는 Markdown을 가지고 문서를 작성하고 이것을 Jekyll을 사용해서 정적 웹 사이트를 제작한다고 생각해보자. Markdown에서 이미지를 삽입하기 위해서는 다음과 같은 문법을 사용한다.

```
![이미지alt](./images/test.png "이미지title")
```

위의 Markdown 문법으로 삽입된 이미지는 HTML 문서에서 다음과 같이 변환이 된다.

```html
<img src="./images/test.png" alt="이미지alt" title="이미지title"/>
```

위 예제를 보면 Markdown 문법에서는 이미지의 사이즈를 지정하는 곳이 없다. Markdown 변환기 중에서는 Markdown의 문법을 확장시켜서 이미지 사이즈를 지정하거나 문법에 스타일을 지정할 수 있도록 지원하는 변환기도 있지만 이것은 Markdown 변환기를 다르게 사용하면 Markdown의 syntax 오류가 발생해버린다. 우리는 그래서 Markdown의 문법을 손상시키지 않는 방법에서 이미지의 사이즈를 변경하거나 스타일을 적용하는 방법을 연구했다. 우리는 이미 Node.js를 이용한 [mark2html](https://github.com/saltfactory/mark2html) 변환기를 만들었는데 **0.0.4** 업데이트에 Markdown에 포함된 이미지의 사이즈를 지정하는 방법을 제공했다. **mark2html**를 이용하는 방법은 [Markdown으로 HTML 변환시 이미지 IMG 사이즈 지정하기](http://blog.saltfactory.net/253) 글을 참조하면 된다.

원리는 다음과 같다.

> Markdown 표준 문법인 **ALT** 속성을 만든는 표기법 안에 **inline style**을 지정하고 Markdown에서 HTML을 변환할 때, ALT에 포함된 inline style을 HTML의 **IMG** 태그의 **style** 속성으로  지정하는 거싱다.

이와 같은 방법으로 처리하기 위해서는 Markdown을 HTML으로 변환하는 메소드 중에 IMG 태그를 변환하는 메소드를 **Override** 해야한다. Node.js로 위 방법을 구현할 때는 [marked](https://github.com/chjj/marked) 변환기를 사용하여 처리했다. 동일한 방법으로 Jekyll의 Markdown 변환기를 Override 하면 가능할 것 같다는 생각을 가지고 Jekyll Plugin을 만들기로 했다.

## Jekyll Plugin 제작

Jekyll은 공식으로 플러그인을 만들 수 있는 [Generator](http://jekyllrb.com/docs/plugins/#generators), [Conveter](http://jekyllrb.com/docs/plugins/#converters), [Command](http://jekyllrb.com/docs/plugins/#command), [Tags](http://jekyllrb.com/docs/plugins/#tags) 그리고 [Filters](http://jekyllrb.com/docs/plugins/#liquid-filters) 모듈을 만들어 두었다. **jekyll-img-converter**에서 사용한 모듈은 **Converter**이다. 다른 모듈에 대한 설명은 앞으로 기회가 있을 때 다시 소개하고 Converter를 이용해서 플러그인을 제작하는 방법을 소개한다.

우리는 Jekyll 프로젝트와 달리 모듈을 만들고 테스트를 하는 방법을 가지고 싶었다. 그래서 우리는 [Ruby](https://www.ruby-lang.org/en/), [gem](https://rubygems.org) 그리고 [Rakefile](http://ruby-doc.org/core-1.9.3/doc/rake/rakefile_rdoc.html)를 사용하여 플로그인을 개발하는 환경을 만들었다.

### jekyll-img-converter.gemspec 

우선 우리는  **jekyll-img-converter**를 **gem**을 상요해서 배포할 것이기 때문에 `.gemspec` 파일을 생성하였다. 이 파일에 포함된 내용은 다음과 같다.

- **name** : 플러그인 이름
- **summary** : 플러그인의 간략한 내용
- **description** : 플러그인의 설명
- **version** : 플러그인의 버전, 이 버전에 따라서 나중에 **gem** 버전 파일이 생성이 된다.
- **authors** : 개발자
- **email** : 개발자 이메일
- **homepage** : 플러그인 사이트
- **license** : 라이센스
- **files** : **gem**을 사용하여 배포할 파일을 지정
- **add_dependency** : 플러그인이 설치되었을 때 필요한 모듈의 의존성을 지정
- **add_development_dependency** : 플러그인을 개발할 때 필요한 모듈을 지정 

```ruby
Gem::Specification.new do |s|
  s.name        = "jekyll-img-converter"
  s.summary     = "Jekyll IMG tag conveter in markdown using with Redcarpet"
  s.description = "jekyll-img-converter is support to convert IMG tag with inline style from markdown using with Redcarpet"
  s.version     = "0.1.4"
  s.authors     = ["SungKwang Song"]
  s.email       = "saltfactory@gmail.com"

  s.homepage    = "https://github.com/saltfactory/jekyll-img-converter"
  s.licenses    = ["MIT"]
  s.files       = [ "lib/jekyll-img-converter.rb" ]

  s.add_dependency "jekyll", '~> 2.0'
  s.add_development_dependency "html-pipeline", '~> 1.9'
  s.add_development_dependency  'rake', '~> 10.3'
  s.add_development_dependency  'rdoc', '~> 4.1'
  s.add_development_dependency  'shoulda', '~> 3.5'
  s.add_development_dependency  'minitest', '~> 5.4'
  s.add_development_dependency  'redcarpet', '~> 3.2'
end

``` 

### Gemfile

Ruby로 프로젝트를 진행할 때 필요한 라이브러리를 기술하고 다운받아서 사용하기 위해서 `Gemfile`을 작성하고 **gem** 으로 설치를 한다. 이것은 Node.js의 `package.json`을 기술해서 사용하는 원리와 비슷하다. 우리는 `.gemspec` 파일에 이미 필요한 라이브러리를 지정했기 때문에 `Gemfile`에서는 **gemspec**을 참조하라고 기술 하면 된다.

```
source "https://rubygems.org"

gemspec
```

`Gemfile`을 생성하면 `bundle install` 명령을 사용하여 필요한 라이브러리를 모두 다운 받아 설치할 수 있다.

```
bundle install
```


### jekyll-img-converter.rb

필요한 라이브러리르 모두 다운받아서 설치하면 플러그인을 개발할 준비를 모두 마친것이다. 우리는 **Jekyll**의 플러그인 모듈 중에서 **Converter** 클래스를  상속받아서 사용할 것이다.

가장 먼저 해야할 일은 **Converter** 클래스를 상속 받는 것이다. 아래 코드를 살펴보면 Converter 클래스 중에 다음 메소드를 오버라이드 하여 사용할 것이다.

- **matches()** : Jekyll에서 해당되는 확장자의 파일에만 적용할 수 있게 확장자를 매칭하는 메소드이다.
- **output_ext()** : 플러그인이 모두 동작하고 결과물을 만들 때의 확장자를 지정하는 메소드이다.
- **convert()** : **Converter** 클래스가 가지는 가장 중요한 메소드로 convert를 실행하는 메소드이다.
- **inintialize()** : 이 클래스가 만들어질 때 자동으로 호출되는 생성자 메소드이다.

```ruby
require 'jekyll'

class SFMarkdownConverter < Converter
    def matches(ext)
    end

    def output_ext(ext)
    end

    def convert(content)
    end

    def initialize(config)
    end
  end
```























