<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRequest;
use App\Http\Requests\UpdateRequest;
use App\Models\Word;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WordController extends Controller
{

    public function store(StoreRequest $request)
    {
        $data = $request->validated();
        Word::create([
            'word' => $data['word'],
            'definition' => $data['definition'],
            'part_of_speech' => $data['part_of_speech'],
            'image_url' => $data['image_url'],
        ]);

        return response([
            'message' => 'Payload was accepted, initation store()...'
        ], 204);
    }

    public function update(UpdateRequest $request)
    {
        $credentials = $request->validated();
        if (!Auth::attempt($credentials)) {
            return response([
                'message' => 'Searched word does not exist, initiation fetchData() now...'
            ], 422);
            $word = Auth::word();
            $definitionData = $word->create();
        }
        return response([
            'message' => 'Searched word already exist, initiation localhost get() now...',
            compact('definitionData')
        ], 204);

    }
    public function destroy(Request $request)
    {
        /** @var Word $word */
        $word = $request->word();
        $word->definitionData()->delete();
        return response('word succesfully deleted', status: 204);
    }
    
}