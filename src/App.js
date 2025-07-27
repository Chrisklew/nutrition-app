import React, { useState, useEffect } from 'react';
import { Search, Scan, Home, User, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

// Enhanced mock product database with more realistic data
const mockProducts = {
  '012000161155': {
    name: 'Coca-Cola Classic',
    brand: 'The Coca-Cola Company',
    image: '/api/placeholder/200/200',
    nutrition: {
      calories: 140,
      sugar: '39g',
      sodium: '45mg',
      servingSize: '12 fl oz'
    },
    ingredients: [
      { 
        name: 'Carbonated Water', 
        category: 'neutral', 
        concern: 'None',
        aiAnalysis: 'Safe hydration base for beverages'
      },
      { 
        name: 'High Fructose Corn Syrup', 
        category: 'concerning', 
        concern: 'Linked to obesity and diabetes',
        aiAnalysis: 'Metabolized differently than regular sugar, may contribute to insulin resistance'
      },
      { 
        name: 'Caramel Color', 
        category: 'concerning', 
        concern: 'May contain 4-methylimidazole (potential carcinogen)',
        aiAnalysis: 'Class IV caramel coloring may contain trace amounts of carcinogenic compounds'
      },
      { 
        name: 'Phosphoric Acid', 
        category: 'concerning', 
        concern: 'Can weaken bones and teeth',
        aiAnalysis: 'Regular consumption linked to decreased bone density and dental erosion'
      },
      { 
        name: 'Natural Flavors', 
        category: 'neutral', 
        concern: 'Generally safe but proprietary blend',
        aiAnalysis: 'FDA approved but specific compounds unknown due to trade secrets'
      },
      { 
        name: 'Caffeine', 
        category: 'neutral', 
        concern: 'Safe in moderation',
        aiAnalysis: '34mg per 12oz - within safe daily limits for most adults'
      }
    ],
    overallScore: 2.1,
    category: 'concerning',
    aiSummary: 'High sugar content and artificial additives make this a concerning choice for regular consumption. Consider limiting to occasional treats.'
  },
  '028400064057': {
    name: 'Honey Nut Cheerios',
    brand: 'General Mills',
    image: '/api/placeholder/200/200',
    nutrition: {
      calories: 110,
      sugar: '9g',
      sodium: '160mg',
      servingSize: '3/4 cup'
    },
    ingredients: [
      { 
        name: 'Whole Grain Oats', 
        category: 'healthy', 
        concern: 'High in fiber and heart-healthy',
        aiAnalysis: 'Excellent source of beta-glucan fiber, proven to lower cholesterol'
      },
      { 
        name: 'Sugar', 
        category: 'concerning', 
        concern: 'High sugar content',
        aiAnalysis: '9g per serving contributes to daily sugar intake, consider in context of total diet'
      },
      { 
        name: 'Oat Bran', 
        category: 'healthy', 
        concern: 'Rich in beta-glucan fiber',
        aiAnalysis: 'Additional fiber source that supports digestive health and satiety'
      },
      { 
        name: 'Modified Corn Starch', 
        category: 'neutral', 
        concern: 'Generally safe thickening agent',
        aiAnalysis: 'Processed ingredient but no significant health concerns at typical consumption levels'
      },
      { 
        name: 'Honey', 
        category: 'neutral', 
        concern: 'Natural sweetener but still sugar',
        aiAnalysis: 'Provides trace antioxidants but nutritionally similar to sugar'
      },
      { 
        name: 'BHT', 
        category: 'concerning', 
        concern: 'Synthetic antioxidant with potential health concerns',
        aiAnalysis: 'Preservative with limited toxicity data, some studies suggest endocrine disruption'
      },
      { 
        name: 'Yellow Dye #6', 
        category: 'concerning', 
        concern: 'Artificial coloring linked to hyperactivity',
        aiAnalysis: 'Some studies link to behavioral issues in children, banned in some European countries'
      }
    ],
    overallScore: 2.8,
    category: 'neutral',
    aiSummary: 'Mixed nutritional profile - healthy whole grains offset by added sugars and artificial additives. Better breakfast option than many cereals but not optimal.'
  },
  '011110856234': {
    name: 'Organic Baby Spinach',
    brand: 'Whole Foods 365',
    image: '/api/placeholder/200/200',
    ingredients: [
      { name: 'Organic Baby Spinach', category: 'healthy', concern: 'Excellent source of iron, vitamins, and antioxidants' }
    ],
    overallScore: 4.8,
    category: 'healthy'
  },
  '070038640776': {
    name: 'Marlboro Red',
    brand: 'Philip Morris',
    image: '/api/placeholder/200/200',
    ingredients: [
      { name: 'Tobacco', category: 'carcinogenic', concern: 'Known carcinogen causing cancer' },
      { name: 'Nicotine', category: 'carcinogenic', concern: 'Highly addictive substance' },
      { name: 'Tar', category: 'carcinogenic', concern: 'Contains multiple carcinogenic compounds' },
      { name: 'Carbon Monoxide', category: 'carcinogenic', concern: 'Toxic gas affecting oxygen transport' }
    ],
    overallScore: 0.1,
    category: 'carcinogenic'
  }
};

const searchableProducts = [
  { barcode: '012000161155', name: 'Coca-Cola Classic', brand: 'The Coca-Cola Company' },
  { barcode: '028400064057', name: 'Honey Nut Cheerios', brand: 'General Mills' },
  { barcode: '011110856234', name: 'Organic Baby Spinach', brand: 'Whole Foods 365' },
  { barcode: '070038640776', name: 'Marlboro Red', brand: 'Philip Morris' }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    diabetes: false,
    hypertension: false,
    allergies: false
  });
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [scanMode, setScanMode] = useState(false);

  // Enhanced AI scoring based on user preferences
  const calculatePersonalizedScore = (product) => {
    let baseScore = product.overallScore;
    let adjustments = 0;

    // Adjust based on user health conditions
    if (userPreferences.diabetes) {
      const highSugarIngredients = product.ingredients.filter(ing => 
        ing.name.toLowerCase().includes('sugar') || 
        ing.name.toLowerCase().includes('syrup') ||
        ing.name.toLowerCase().includes('fructose')
      );
      adjustments -= highSugarIngredients.length * 0.5;
    }

    if (userPreferences.hypertension) {
      if (product.nutrition?.sodium && parseInt(product.nutrition.sodium) > 200) {
        adjustments -= 0.3;
      }
    }

    // Positive adjustments for dietary preferences
    if (userPreferences.vegetarian || userPreferences.vegan) {
      const plantBasedIngredients = product.ingredients.filter(ing => 
        ing.category === 'healthy' && !ing.name.toLowerCase().includes('meat')
      );
      adjustments += plantBasedIngredients.length * 0.1;
    }

    return Math.max(0.1, Math.min(5.0, baseScore + adjustments));
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = searchableProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'neutral': return 'text-yellow-600 bg-yellow-100';
      case 'concerning': return 'text-orange-600 bg-orange-100';
      case 'carcinogenic': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'neutral': return <Info className="w-4 h-4" />;
      case 'concerning': return <AlertTriangle className="w-4 h-4" />;
      case 'carcinogenic': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const handleProductSelect = (barcode) => {
    const product = mockProducts[barcode];
    setCurrentProduct(product);
    setCurrentTab('product');
  };

  const simulateBarcodeScan = () => {
    setScanMode(true);
    // Simulate scanning delay
    setTimeout(() => {
      const randomProduct = Object.keys(mockProducts)[Math.floor(Math.random() * Object.keys(mockProducts).length)];
      handleProductSelect(randomProduct);
      setScanMode(false);
    }, 2000);
  };

  const renderHome = () => (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nutrition Intelligence</h1>
        <p className="text-gray-600">Scan or search to analyze food ingredients</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((product) => (
            <div
              key={product.barcode}
              onClick={() => handleProductSelect(product.barcode)}
              className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-600">{product.brand}</div>
            </div>
          ))}
        </div>
      )}

      {/* Scan Button */}
      <div className="text-center">
        <button
          onClick={simulateBarcodeScan}
          disabled={scanMode}
          className={`w-full py-4 px-6 rounded-lg font-medium transition-all ${
            scanMode
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          <Scan className="w-6 h-6 mx-auto mb-2" />
          {scanMode ? 'Scanning...' : 'Scan Barcode'}
        </button>
      </div>

      {/* Recent Products */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(mockProducts).slice(0, 4).map(([barcode, product]) => (
            <div
              key={barcode}
              onClick={() => handleProductSelect(barcode)}
              className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
              <div className="text-xs text-gray-600 truncate">{product.brand}</div>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${getCategoryColor(product.category)}`}>
                {getCategoryIcon(product.category)}
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProduct = () => {
    if (!currentProduct) return null;

    return (
      <div className="p-4 space-y-6">
        {/* Product Header */}
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <div className="text-gray-500 text-xs">Product Image</div>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{currentProduct.name}</h1>
          <p className="text-gray-600">{currentProduct.brand}</p>
        </div>

        {/* Overall Score with Personalization */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Health Score</h2>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {calculatePersonalizedScore(currentProduct).toFixed(1)}/5.0
                </p>
                {calculatePersonalizedScore(currentProduct) !== currentProduct.overallScore && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    Personalized
                  </span>
                )}
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-medium ${getCategoryColor(currentProduct.category)}`}>
              {getCategoryIcon(currentProduct.category)}
              {currentProduct.category.charAt(0).toUpperCase() + currentProduct.category.slice(1)}
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  calculatePersonalizedScore(currentProduct) >= 4 ? 'bg-green-500' :
                  calculatePersonalizedScore(currentProduct) >= 3 ? 'bg-yellow-500' :
                  calculatePersonalizedScore(currentProduct) >= 2 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${(calculatePersonalizedScore(currentProduct) / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Nutrition Facts */}
        {currentProduct.nutrition && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Nutrition Facts</h2>
            <div className="text-sm text-gray-600 mb-2">Per {currentProduct.nutrition.servingSize}</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{currentProduct.nutrition.calories}</div>
                <div className="text-xs text-gray-600">Calories</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{currentProduct.nutrition.sugar}</div>
                <div className="text-xs text-gray-600">Sugar</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{currentProduct.nutrition.sodium}</div>
                <div className="text-xs text-gray-600">Sodium</div>
              </div>
            </div>
          </div>
        )}

        {/* AI Summary */}
        {currentProduct.aiSummary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">AI Analysis</h2>
            <p className="text-sm text-blue-800">{currentProduct.aiSummary}</p>
          </div>
        )}

        {/* Toggle for detailed AI analysis */}
        <div className="text-center">
          <button
            onClick={() => setShowAIAnalysis(!showAIAnalysis)}
            className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
          >
            {showAIAnalysis ? 'Hide' : 'Show'} Detailed AI Analysis
          </button>
        </div>

        {/* Ingredients Analysis */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Ingredient Analysis</h2>
          {currentProduct.ingredients.map((ingredient, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{ingredient.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ingredient.concern}</p>
                  {showAIAnalysis && ingredient.aiAnalysis && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                      <strong>AI Analysis:</strong> {ingredient.aiAnalysis}
                    </div>
                  )}
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ml-3 ${getCategoryColor(ingredient.category)}`}>
                  {getCategoryIcon(ingredient.category)}
                  {ingredient.category.charAt(0).toUpperCase() + ingredient.category.slice(1)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <button
          onClick={() => setCurrentTab('home')}
          className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Back to Search
        </button>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Dietary Preferences</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="vegetarian" 
              className="rounded" 
              checked={userPreferences.vegetarian}
              onChange={(e) => setUserPreferences(prev => ({...prev, vegetarian: e.target.checked}))}
            />
            <label htmlFor="vegetarian" className="text-gray-700">Vegetarian</label>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="vegan" 
              className="rounded" 
              checked={userPreferences.vegan}
              onChange={(e) => setUserPreferences(prev => ({...prev, vegan: e.target.checked}))}
            />
            <label htmlFor="vegan" className="text-gray-700">Vegan</label>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="gluten-free" 
              className="rounded" 
              checked={userPreferences.glutenFree}
              onChange={(e) => setUserPreferences(prev => ({...prev, glutenFree: e.target.checked}))}
            />
            <label htmlFor="gluten-free" className="text-gray-700">Gluten-Free</label>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Health Concerns</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="diabetes" 
              className="rounded" 
              checked={userPreferences.diabetes}
              onChange={(e) => setUserPreferences(prev => ({...prev, diabetes: e.target.checked}))}
            />
            <label htmlFor="diabetes" className="text-gray-700">Diabetes</label>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="hypertension" 
              className="rounded" 
              checked={userPreferences.hypertension}
              onChange={(e) => setUserPreferences(prev => ({...prev, hypertension: e.target.checked}))}
            />
            <label htmlFor="hypertension" className="text-gray-700">High Blood Pressure</label>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="allergies" 
              className="rounded" 
              checked={userPreferences.allergies}
              onChange={(e) => setUserPreferences(prev => ({...prev, allergies: e.target.checked}))}
            />
            <label htmlFor="allergies" className="text-gray-700">Food Allergies</label>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">Personalization Active!</h3>
        <p className="text-sm text-green-800">
          Your health scores are now personalized based on your preferences. Products will be scored differently based on your dietary needs and health concerns.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Coming Soon:</strong> Advanced AI recommendations, meal planning, and integration with fitness trackers.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Status Bar Simulation */}
      <div className="bg-black text-white text-xs p-2 text-center">
        9:41 AM • Nutrition Intelligence
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {currentTab === 'home' && renderHome()}
        {currentTab === 'product' && renderProduct()}
        {currentTab === 'profile' && renderProfile()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center p-2 ${currentTab === 'home' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={simulateBarcodeScan}
            className={`flex flex-col items-center p-2 ${scanMode ? 'text-gray-400' : 'text-gray-600'}`}
            disabled={scanMode}
          >
            <Scan className="w-6 h-6" />
            <span className="text-xs mt-1">Scan</span>
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex flex-col items-center p-2 ${currentTab === 'profile' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}