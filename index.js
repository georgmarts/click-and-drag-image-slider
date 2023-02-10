const { useState, useEffect, useContext, useRef, useMemo, Children, useLayoutEffect } = React;


function ClickAndDragImageSlider({slides}) {

  const [offset, setOffset] = useState(0)
  const [offsetForThumbs, setOffsetForThumbs] = useState(0)
  const [offsetBorder, setOffsetBorder] = useState(0)
  const thumbWidth = 100
  const thumbsPerBlock = 6.7
  const itemWidth = thumbWidth*thumbsPerBlock
  const [overflowWidth, setOverflowWidth] = useState(`${itemWidth}px`)
  const [overflowHeight, setOverflowHeight] = useState('495px')
  const [status, setStatus] = useState(false)
  const [statusForNextPrevClick, setStatusForNextPrevClick] = useState(false)
  const mainContainerRef = useRef() // reference to the thumbs container
  const thumbsContainerRef = useRef() // reference to the thumbs container
  const [startPosition, setStartPosition] = useState(0)
  const [startPositionForImg, setStartPositionForImg] = useState(0)
  const transformValue = 'transform 0.2s'
  const [transform, setTransform] = useState(transformValue)
  const [lightsOff, setLightsOff] = useState(false)
  const w = document.body.clientWidth
  const [imageContainerHeight, setImageContainerHeight] = useState('400px')
  const [thumbHeight, setthumbHeight] = useState('65px')
  const [imageContainerWidth, setImageContainerWidth] = useState(`${itemWidth}px`)
  const endThumbsLimit = -Math.abs((slides.length-1-thumbsPerBlock)*thumbWidth+thumbWidth)
  const endThumbsLimitForFullscreen = -Math.abs((slides.length-1-(w/thumbWidth))*thumbWidth+thumbWidth)
  const [savedOffset, setSavedOffset] = useState(0) // use to make photos slide right and left with minimal mouse move
  const [savedOffsetForThumbs, setSavedOffsetForThumbs] = useState(0) // use to make photos slide right and left with minimal mouse move
  const [savedOffsetForBorder, setSavedOffsetForBorder] = useState(0) // use to make photos slide right and left with minimal mouse move
  const [cursorProperty, setCursorProperty] = useState('')
  const [containerPosition, setContainerPosition] = useState('relative')

  // Styles

  const imagesContainerStyle = {
    cursor: cursorProperty
  }

  const overflowStyle = {
    position: containerPosition,
    width: `${overflowWidth}`,
    height: `${overflowHeight}`
  }

  const thumbsContainerStyle = {
    transform: `translateX(${offsetForThumbs}px)`,
    transition: `${transform}`,
    width: `${thumbWidth*thumbsPerBlock}px`,
    cursor: cursorProperty
  }

  const thumbContainerStyle = {
    left: `${offsetBorder}px`,
    width: `${thumbWidth - 3}px`, // 3 is substracted because of border width
    height: '62px'
  }

// Mouse events on Images

  function handleMouseDownOnImg(e) {
    setStatus(true)
    setTransform(null)
    setStartPositionForImg((e.nativeEvent.pageX - thumbsContainerRef.current.offsetLeft) - offset)
  }

  function handleMouseMoveOnImg(e) {
    e.preventDefault();
    if (!status) return;
    setOffset((e.nativeEvent.pageX - thumbsContainerRef.current.offsetLeft) - startPositionForImg)
    setCursorProperty('grabbing')
    }

  function handleMouseUpAndLeaveOnImg() {
    if (!status) return;
    setStatus(false)  
    setTransform(transformValue)
    setCursorProperty('')
    setOffsetBorder(offset < savedOffset ? offsetBorder + thumbWidth : offsetBorder - thumbWidth),
    setOffsetForThumbs(offset < savedOffset ? offsetForThumbs - thumbWidth : offsetForThumbs + thumbWidth)   
    
    !lightsOff ?

    setOffset(offset < savedOffset ? Math.floor(offset/itemWidth)*itemWidth : Math.ceil(offset/itemWidth)*itemWidth) :
    setOffset(offset < savedOffset? Math.floor(offset/w)*w : Math.ceil(offset/w)*w)

  }

// Mouse events on thumbnails

  function handleMouseOver() {
    setTransform(transformValue)
  }

  function handleMouseDownOnThumbs(e) {
    setStatusForNextPrevClick(false)
    setStatus(true)
    setTransform(null)
    setStartPosition((e.nativeEvent.pageX - thumbsContainerRef.current.offsetLeft) - offsetForThumbs)
  }

  function handleMouseMoveOnThumbs(e) {
    if (!status) return;
    setStatusForNextPrevClick(true)
    setTransform(null)
    e.preventDefault();
    setOffsetForThumbs((e.nativeEvent.pageX - thumbsContainerRef.current.offsetLeft) - startPosition)
    setCursorProperty('grabbing')
    }

  function handleMouseUpAndLeaveOnThumbs() {
    if (!status) return;
    setTransform(transformValue)
    setStatus(false)
    setCursorProperty('')
  }

  // Function when thumbs are clicked

  function handleImageClick(slide, index) {
    setTransform(transformValue)
    !statusForNextPrevClick ? (setOffsetBorder(index*thumbWidth), setOffset(-index*itemWidth)) : null
    lightsOff && !statusForNextPrevClick ? setOffset(-index*w) : null


    // right

    index > (offsetBorder/thumbWidth) && !statusForNextPrevClick ? offsetForThumbs%thumbWidth === 0 ?
    setOffsetForThumbs(offsetForThumbs-(0.7*thumbWidth)) :
    setOffsetForThumbs(offsetForThumbs-thumbWidth) : null

    // left

    index < (offsetBorder/thumbWidth) && !statusForNextPrevClick ? offsetForThumbs%thumbWidth === -thumbWidth*0.3 ?
    setOffsetForThumbs(offsetForThumbs+(0.7*thumbWidth)) :
    setOffsetForThumbs(offsetForThumbs+thumbWidth) : null

  }

  // PREV and NEXT button function

    function prev() {
      setTransform(transformValue)
      setStatusForNextPrevClick(false) 

      !lightsOff?
      (setOffset(prev => prev + itemWidth), setOffsetBorder(prev => prev - thumbWidth),
      setOffsetForThumbs(offsetForThumbs === endThumbsLimit ? prev => prev + (thumbWidth*0.7) : prev => prev + thumbWidth)) :
      null

      lightsOff ? (setOffset(prev => prev + w), setOffsetBorder(prev => prev - thumbWidth),
      setOffsetForThumbs(offsetForThumbs === endThumbsLimitForFullscreen ? prev => prev + (thumbWidth*0.7) : prev => prev + thumbWidth)) :
      null
    }

    function next() {
      setTransform(transformValue)
      setStatusForNextPrevClick(false)

      !lightsOff?
      (setOffset(prev => prev - itemWidth),
      setOffsetBorder(prev => prev + thumbWidth),
      setOffsetForThumbs(offsetForThumbs === 0? prev => prev - (thumbWidth*0.7) : prev => prev - thumbWidth)) :
      null

      lightsOff?
      (setOffset(prev => prev - w),
      setOffsetBorder(prev => prev + thumbWidth),
      setOffsetForThumbs(offsetForThumbs === 0? prev => prev - (thumbWidth*0.7) : prev => prev - thumbWidth))
      : null
    }

    function zoomIn() {
      lightsOff ?

      (mainContainerRef.current.style.backgroundColor = 'white',
      setOverflowWidth(`${itemWidth}px`),
      setOverflowHeight('495px'),
      setOffset(offset/w*itemWidth),
      offsetForThumbs <= -Math.abs((slides.length-1-(w/thumbWidth))*thumbWidth+thumbWidth) ?
      setOffsetForThumbs(endThumbsLimit) :
      setOffsetForThumbs(offset/w*thumbWidth),
      setLightsOff(prev => !prev),
      setTransform(null),
      setImageContainerHeight('400px'),
      setImageContainerWidth(`${itemWidth}`),
      setContainerPosition('relative'),
      document.body.style.overflow = 'visible') :

      (mainContainerRef.current.style.backgroundColor = 'black',
      setOverflowWidth('100%'),
      setOverflowHeight('100%'),
      setOffset(offset/itemWidth*w),
      offsetForThumbs <= endThumbsLimit ?
      setOffsetForThumbs(-Math.abs((slides.length-1-(w/thumbWidth))*thumbWidth+thumbWidth)) : null,    
      setLightsOff(prev => !prev),
      setTransform(null),
      setImageContainerHeight('85vh'),
      setImageContainerWidth('100%'),
      setContainerPosition('fixed'),
      document.body.style.overflow = 'hidden')
    }

    useEffect(() => {

      offset >= 0 && !status ? (setOffset(0), setOffsetBorder(0)) : null
      offset <= -(slides.length - 1)*itemWidth && !lightsOff && !status? setOffset(-(slides.length - 1)*itemWidth) : null
      offset <= -(slides.length - 1)*w && lightsOff && !status? setOffset(-(slides.length - 1)*w) : null
    
      offsetForThumbs >= 0 && !status ? setOffsetForThumbs(0) : null
      offsetForThumbs <= endThumbsLimit && !status ? 
      setOffsetForThumbs(endThumbsLimit) : null
      offsetForThumbs <= endThumbsLimitForFullscreen && !status && lightsOff ?
      setOffsetForThumbs(endThumbsLimitForFullscreen) : null

      offsetBorder <= 0 ? setOffsetBorder(0) : null
      offsetBorder > (slides.length - 1)*thumbWidth ? setOffsetBorder((slides.length - 1)*thumbWidth) : null

      slides.length*thumbWidth <= w && lightsOff ? setOffsetForThumbs((w-slides.length*thumbWidth)/2) : null 
      slides.length*thumbWidth <= itemWidth && !lightsOff ? setOffsetForThumbs((itemWidth-slides.length*thumbWidth)/2) : null 

      setSavedOffset(offset)
    
    }, [status, offsetForThumbs, offsetBorder, lightsOff])

    // console.log(offsetBorder, savedOffsetForBorder)
  
  return <>
  
  <main style={overflowStyle} ref={mainContainerRef} className='photo-slide-container'>

  <section className='images-container' style ={imagesContainerStyle}
>
  {slides.map(slide => <div className='image-container' onMouseMove={handleMouseMoveOnImg} onMouseDown={handleMouseDownOnImg} 
  onMouseUp={handleMouseUpAndLeaveOnImg} onMouseLeave={handleMouseUpAndLeaveOnImg}
    style={{
    backgroundImage: `url(${slide.img})`, width: `${imageContainerWidth}`, height: `${imageContainerHeight}`,
    transform: `translateX(${offset}px)`,
    transition: `${transform}`,
    }}></div>)}
  <p className='prev-btn' onClick ={prev}>&#11207;</p>
  <p className='next-btn' onClick ={next}>&#11208;</p>
  <p className='zoom-in' onClick ={zoomIn}>&#x26F6;</p>
  </section>



  <section ref={thumbsContainerRef} 
  onMouseMove={handleMouseMoveOnThumbs} onMouseOver = {handleMouseOver}
  onMouseDown={handleMouseDownOnThumbs} onMouseUp={handleMouseUpAndLeaveOnThumbs} onMouseLeave={handleMouseUpAndLeaveOnThumbs}
 style={thumbsContainerStyle} className='thumbs-container'>
  <div style={thumbContainerStyle} className='thumb-border-container'></div>
  {slides.map((slide, index) => <div className='thumb-container' onClick={() => handleImageClick(slide, index)}
  style={{
    backgroundImage: `url(${slide.img})`, width: `${thumbWidth}px`, height: thumbHeight,
    backgroundSize: `${thumbWidth}px ${thumbHeight}`,
    backgroundSize: 'cover'
    }}></div>)}
  </section>

  </main> 
  
  </> 
}

function App() {
  const [slides, setSlides] = useState([
    {id: 1, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d6a1a79b.webp'},
    {id: 2, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d65c4b73.webp'},
    {id: 3, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d62e5621.webp'},
    {id: 4, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d65c4b73.webp'},
    {id: 1, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d6a1a79b.webp'},
    {id: 2, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d65c4b73.webp'},
    {id: 3, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d62e5621.webp'},
    {id: 4, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d65c4b73.webp'},
    {id: 1, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d6a1a79b.webp'},
    {id: 4, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d65c4b73.webp'},
    {id: 1, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d6a1a79b.webp'},
    {id: 2, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d65c4b73.webp'},
    {id: 3, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d62e5621.webp'},
    {id: 4, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d65c4b73.webp'},
    {id: 1, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d6a1a79b.webp'},
    {id: 2, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d65c4b73.webp'},
    {id: 3, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d62e5621.webp'},
    {id: 4, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d65c4b73.webp'},
    {id: 1, status:'off', img:'https://cis.minsk.by/img/news/24751/full/63da4d6a1a79b.webp'}

    ])

  return <ClickAndDragImageSlider slides={slides}/>
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>)
