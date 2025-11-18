import React, { useEffect, useState } from 'react';
import { X, Plus, Image } from 'lucide-react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { useDispatch, useSelector } from 'react-redux';
import { gettopics } from '../../../redux/slices/topics.slice';

export default function PageCreateModal({ setIsOpen, isOpen, setSelectedType }) {

  const [formData, setFormData] = useState({
    name: '',
    about: '',
    topic: '',
    keywords: '',
    pageType: 'public'
  });
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePage = () => {
    console.log('Page created:', formData);
    setSelectedType("Page done");
    setFormData({ name: '', about: '', topic: '', keywords: '', pageType: 'public' });
    setUploadedImage(null);
  };
  const dispatch = useDispatch();

  const { alltopics, isLoading } = useSelector((state) => state.topics);

  useEffect(() => {
    dispatch(gettopics());
  }, [dispatch])

  console.log(alltopics, "alltopics")

  return (
    <div >

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"

          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl animate-slideUp overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Create Page</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <X className="w-7 h-7" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">

                  <Input
                    label="Name"
                    size="md"
                    type="text"
                    placeholder="Text goes here"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}

                  />



                  <Input
                    label="About"
                    size="md"
                    type="text"
                    placeholder="Text goes here"
                    value={formData.about}
                    onChange={(e) => handleInputChange('about', e.target.value)}

                  />

                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Topic / Category
                    </label>

                    <select
                      disabled={isLoading}
                      className={`w-full border rounded-lg px-4 py-2 text-gray-700 focus:ring-2 
      focus:ring-orange-500 focus:outline-none 
      ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      value={formData.topic}
                      onChange={(e) => handleInputChange("topic", e.target.value)}
                    >
                      {isLoading ? (
                        <option>Loading topics...</option>
                      ) : (
                        <>
                          <option value="">Select Topic</option>
                          {alltopics?.map((item) => (
                            <option key={item._id} value={item.name}>
                              {item.name}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>



                  <Input
                    label="Keywords"
                    size="md"
                    type="text"
                    placeholder="Text goes here"
                    value={formData.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}

                  />
                </div>


                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-4">
                      Topic Page Type
                    </label>

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      fileClassName="w-[100px] h-[100px]"
                      preview={uploadedImage}
                    />





                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-4">
                      Topic Page Type
                    </label>
                    <div className="space-y-4">
                      <label className="flex items-start cursor-pointer group">
                        <input
                          type="radio"
                          name="pageType"
                          value="public"
                          checked={formData.pageType === 'public'}
                          onChange={(e) => handleInputChange('pageType', e.target.value)}
                          className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="ml-3">
                          <div className="font-semibold text-gray-900">Public</div>
                          <div className="text-sm text-gray-500">
                            Anyone can view, post and comment to this page.
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start cursor-pointer group">
                        <input
                          type="radio"
                          name="pageType"
                          value="private"
                          checked={formData.pageType === 'private'}
                          onChange={(e) => handleInputChange('pageType', e.target.value)}
                          className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="ml-3">
                          <div className="font-semibold text-gray-900">Private</div>
                          <div className="text-sm text-gray-500">
                            Only approved users can view and submit to this page.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleCreatePage}
                  className="w-full flex  justify-center" size="lg" variant="orange"
                >
                  Create Page
                </Button>
              </div>
            </div>
          </div>
        </>
      )}


    </div>
  );
}