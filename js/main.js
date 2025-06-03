document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('dropArea');
    const browseBtn = document.getElementById('browseBtn');
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const svgPreview = document.getElementById('svgPreview');
    const resultPlaceholder = document.getElementById('resultPlaceholder');
    const resultContent = document.getElementById('resultContent');
    const downloadBtn = document.getElementById('downloadBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    
    // Ensure ImageTracer is available
    if(typeof ImageTracer === 'undefined') {
        errorMessage.textContent = 'Error: ImageTracer library failed to load. Please refresh the page and try again.';
        errorMessage.style.display = 'block';
    }
    
    // Handle file selection via button
    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        dropArea.classList.remove('drag-over');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            handleFiles(files);
        }
    }
    
    function handleFileSelect(e) {
        handleFiles(e.target.files);
    }
    
    function handleFiles(files) {
        errorMessage.style.display = 'none';
        const file = files[0];
        
        if (!file || !file.type.match('image.*')) {
            errorMessage.textContent = 'Please select an image file (PNG, JPG, JPEG).';
            errorMessage.style.display = 'block';
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            errorMessage.textContent = 'File size exceeds 10MB limit. Please use a smaller file.';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Display image preview
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            imagePlaceholder.style.display = 'none';
            
            // Convert to SVG
            convertToSVG(file);
        };
        reader.readAsDataURL(file);
    }
    
    function convertToSVG(file) {
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        resultContent.style.display = 'none';
        resultPlaceholder.style.display = 'flex';
        
        // Convert after a small delay to allow UI to update
        setTimeout(() => {
            const reader = new FileReader();
            reader.onload = function(event) {
                // Use ImageTracer to convert to SVG
                if(typeof ImageTracer === 'undefined') {
                    errorMessage.textContent = 'ImageTracer library is not available. Please refresh the page.';
                    errorMessage.style.display = 'block';
                    loadingIndicator.style.display = 'none';
                    return;
                }
                
                try {
                    // Optimized settings for diagram tracing
                    const options = {
                        ltres: 0.05,          // Lower line threshold for sharper text
                        qtres: 0.05,          // Lower quadratic spline threshold for text details
                        pathomit: 0,          // Include all paths
                        colorsampling: 0,     // Use all colors
                        numberofcolors: 256,  // Higher color count for better color depth
                        mincolorratio: 0.001, // Include even small color areas
                        colorquantcycles: 5,  // More quantization cycles for better color accuracy
                        scale: 1,
                        viewbox: true,
                        linefilter: true,
                        blurradius: 0,
                        blurdelta: 0,
                        strokewidth: 1.5,     // Increased stroke width for darker appearance
                        roundcoords: 0,       // No coordinate rounding for precision
                        desc: true,
                        layercontainerid: 'svgPreview'
                    };
                    
                    ImageTracer.imageToSVG(
                        event.target.result,
                        function(svgStr) {
                            // Display SVG preview
                            svgPreview.innerHTML = svgStr;
                            
                            // Prepare download link
                            const blob = new Blob([svgStr], { type: 'image/svg+xml' });
                            const url = URL.createObjectURL(blob);
                            downloadBtn.href = url;
                            
                            // Show result
                            loadingIndicator.style.display = 'none';
                            resultContent.style.display = 'block';
                            resultPlaceholder.style.display = 'none';
                        },
                        options
                    );
                } catch(e) {
                    errorMessage.textContent = 'Conversion error: ' + e.message;
                    errorMessage.style.display = 'block';
                    loadingIndicator.style.display = 'none';
                    resultPlaceholder.style.display = 'flex';
                }
            };
            reader.readAsDataURL(file);
        }, 300);
    }
    
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});