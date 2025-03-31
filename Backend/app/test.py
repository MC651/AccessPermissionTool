
def test_list(profile_image, id_card,unilav, visa = None):
    files_to_save = [profile_image, id_card, unilav]
    file_names = ["profile_image", "id_card", "unilav"]
    
    if visa:
        file_names.append("visa")
        files_to_save.append(visa)
    return files_to_save, file_names

profile_image = "profile_image.png"
id_card = "id_card.png"
visa = "visa.pdf"
unilav = "unilav.pdf"
test = test_list(profile_image, id_card, unilav)
print(test)
    


